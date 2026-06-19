#!/usr/bin/env bash
# 服务器端一键修复：Postgres docker 网桥可达 + 重启网关 + 验证 auth
set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-/root/profile-v1}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.gateway.yml}"

cd "$DEPLOY_DIR"

compose() {
  if docker compose version >/dev/null 2>&1; then docker compose "$@";
  else docker-compose "$@"; fi
}

echo "========== 1. 现状 =========="
grep -E '^(REGISTRY|IMAGE_TAG|GATEWAY_PORT|DATABASE_URL)=' .env 2>/dev/null \
  | sed 's/\(DATABASE_URL=postgresql:\/\/postgres:\)[^@]*/\1***/' || true
compose -f "$COMPOSE_FILE" ps

echo
echo "========== 2. 容器 DB 探测 =========="
compose -f "$COMPOSE_FILE" exec -T web printenv DATABASE_URL \
  | sed 's/\(postgresql:\/\/postgres:\)[^@]*/\1***/' || true
compose -f "$COMPOSE_FILE" exec -T web getent hosts host.docker.internal || true
compose -f "$COMPOSE_FILE" exec -T web sh -c 'nc -zv -w3 host.docker.internal 5432' 2>&1 || true
ss -tlnp | grep ':5432' || true

echo
echo "========== 3. web 日志 =========="
compose -f "$COMPOSE_FILE" logs web --tail=60 2>&1 || true

echo
echo "========== 4b. 修正 APP_CONFIG_PATH 挂载路径 =========="
if grep -q 'APP_CONFIG_PATH: config/app.config.production.yaml' docker-compose.gateway.yml 2>/dev/null; then
  sed -i 's|APP_CONFIG_PATH: config/app.config.production.yaml|APP_CONFIG_PATH: /app/config/app.config.production.yaml|g' docker-compose.gateway.yml
  echo "已更新 docker-compose APP_CONFIG_PATH 为绝对路径"
fi

echo
echo "========== 4. 修复 Postgres 监听（Linux Docker 常见根因）=========="
PG_CONF=""
PG_HBA=""
for d in /etc/postgresql/*/main /var/lib/pgsql/data; do
  if [ -f "$d/postgresql.conf" ]; then
    PG_CONF="$d/postgresql.conf"
    PG_HBA="$d/pg_hba.conf"
    break
  fi
done

if [ -n "$PG_CONF" ]; then
  echo "PG conf: $PG_CONF"
  BRIDGE_IP="$(docker network inspect profile-v1_profile -f '{{range .IPAM.Config}}{{.Gateway}}{{end}}' 2>/dev/null || echo 172.17.0.1)"
  if ! grep -qE "listen_addresses.*(${BRIDGE_IP//./\\.}|172\.17\.0\.1|\*)" "$PG_CONF"; then
    if grep -q "^listen_addresses" "$PG_CONF"; then
      sed -i "s/^listen_addresses.*/listen_addresses = 'localhost,${BRIDGE_IP}'/" "$PG_CONF"
    elif grep -q "^#listen_addresses" "$PG_CONF"; then
      sed -i "s/^#listen_addresses.*/listen_addresses = 'localhost,${BRIDGE_IP}'/" "$PG_CONF"
    else
      echo "listen_addresses = 'localhost,${BRIDGE_IP}'" >> "$PG_CONF"
    fi
    echo "已设置 listen_addresses = localhost,${BRIDGE_IP}"
  else
    echo "listen_addresses 已包含 docker 网桥，跳过"
  fi
  if [ -f "$PG_HBA" ] && ! grep -q '172.17.0.0/16' "$PG_HBA"; then
    echo "host    all    all    172.17.0.0/16    scram-sha-256" >> "$PG_HBA"
    echo "已追加 pg_hba docker 网段"
  fi
  systemctl reload postgresql 2>/dev/null \
    || service postgresql reload 2>/dev/null \
    || pg_ctl reload -D "$(dirname "$PG_CONF")" 2>/dev/null \
    || true
else
  echo "未找到 postgresql.conf，跳过 Postgres 监听修复"
fi

echo
echo "========== 5. 确保 DATABASE_URL =========="
if [ -x ./ensure-database-url.sh ]; then
  FIXED_URL="$(./ensure-database-url.sh)"
elif [ -f ./ensure-database-url.sh ]; then
  FIXED_URL="$(bash ./ensure-database-url.sh)"
else
  FIXED_URL=""
fi

if [ -n "$FIXED_URL" ]; then
  OLD_URL=""
  if [ -f .env ]; then
    OLD_URL="$(grep '^DATABASE_URL=' .env | tail -1 | sed -E 's/^DATABASE_URL=//' | tr -d '"' || true)"
  fi
  sed -i '/^DATABASE_URL=/d' .env 2>/dev/null || true
  printf 'DATABASE_URL=%s\n' "$FIXED_URL" >> .env
  echo "已写入校验后的 DATABASE_URL"
  if [ "${POST_DEPLOY:-}" = "1" ] && [ "$OLD_URL" != "$FIXED_URL" ]; then
    echo "DATABASE_URL 已变更，重建 web/calendar/teach_hub"
    compose -f "$COMPOSE_FILE" up -d --force-recreate web calendar teach_hub
    if [ -x ./wait-gateway-ready.sh ]; then
      GATEWAY_PORT="${GATEWAY_PORT:-3000}" ./wait-gateway-ready.sh
    elif [ -f ./wait-gateway-ready.sh ]; then
      GATEWAY_PORT="${GATEWAY_PORT:-3000}" bash ./wait-gateway-ready.sh
    else
      sleep 20
    fi
  elif [ "${POST_DEPLOY:-}" = "1" ]; then
    echo "DATABASE_URL 未变更，跳过容器重建"
  fi
else
  echo "WARN: ensure-database-url.sh 失败，保留现有 .env"
fi
grep '^DATABASE_URL=' .env | sed 's/\(postgresql:\/\/postgres:\)[^@]*/\1***/' || true

echo
echo "========== 5b. Postgres 连通与 session 表 =========="
DB_URL="$(grep '^DATABASE_URL=' .env | tail -1 | sed -E 's/^DATABASE_URL=//' | tr -d '"')"
HOST_DB_URL="${DB_URL/@host.docker.internal/@127.0.0.1}"
if command -v psql >/dev/null 2>&1; then
  psql "$HOST_DB_URL" -c 'SELECT 1 AS ok' 2>&1 || true
  psql "$HOST_DB_URL" -c 'SELECT count(*) FROM "session"' 2>&1 || psql "$HOST_DB_URL" -c 'SELECT count(*) FROM session' 2>&1 || true
else
  docker run --rm postgres:15-alpine psql "$HOST_DB_URL" -c 'SELECT 1 AS ok' 2>&1 || true
  docker run --rm postgres:15-alpine psql "$HOST_DB_URL" -c 'SELECT count(*) FROM "session"' 2>&1 || true
fi

echo
echo "========== 5c. calendar 表结构 =========="
if [ -x ./ensure-calendar-schema.sh ]; then
  ./ensure-calendar-schema.sh
elif [ -f ./ensure-calendar-schema.sh ]; then
  bash ./ensure-calendar-schema.sh
fi

echo
if [ "${POST_DEPLOY:-}" = "1" ]; then
  echo "========== 6. 跳过二次重启（deploy-profile-v1.sh 已启动栈）=========="
  sleep 5
else
  echo "========== 6. 重启网关栈 =========="
  compose -f "$COMPOSE_FILE" pull
  compose -f "$COMPOSE_FILE" down --remove-orphans
  compose -f "$COMPOSE_FILE" up -d
  sleep 20
fi

echo
echo "========== 7. 验证 =========="
compose -f "$COMPOSE_FILE" ps
compose -f "$COMPOSE_FILE" exec -T web sh -c 'nc -zv -w3 host.docker.internal 5432' 2>&1 || true
curl -sS -o /dev/null -w "GET /api/auth/get-session => %{http_code}\n" http://127.0.0.1:3000/api/auth/get-session
curl -sS http://127.0.0.1:3000/api/auth/get-session; echo
compose -f "$COMPOSE_FILE" logs web --tail=30 2>&1 || true
echo
echo "========== 8. 外层 nginx 审计 =========="
if [ -x ./audit-outer-nginx.sh ]; then
  ./audit-outer-nginx.sh
elif [ -f ./audit-outer-nginx.sh ]; then
  bash ./audit-outer-nginx.sh
fi

echo
echo "========== 9. 同步内层网关 nginx 配置 =========="
if [ -f nginx/profile-platform.conf ] && [ -f nginx/proxy-params.conf ]; then
  compose -f "$COMPOSE_FILE" exec -T nginx nginx -t 2>&1 || true
  compose -f "$COMPOSE_FILE" exec -T nginx nginx -s reload 2>&1 || compose -f "$COMPOSE_FILE" restart nginx || true
fi

echo
echo "========== 10. 冒烟测试 =========="
if [ "${POST_DEPLOY:-}" = "1" ]; then
  echo "POST_DEPLOY=1：deploy-profile-v1.sh 已执行冒烟测试，跳过重复校验"
elif [ -x ./smoke-test-gateway.sh ]; then
  ./smoke-test-gateway.sh
elif [ -f ./smoke-test-gateway.sh ]; then
  bash ./smoke-test-gateway.sh
fi
