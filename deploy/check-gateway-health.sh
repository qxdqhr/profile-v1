#!/usr/bin/env bash
# 网关栈健康检查：DB 连通性 + auth + 子应用
set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-/root/profile-v1}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.gateway.yml}"

cd "$DEPLOY_DIR"

compose_cmd() {
  if docker compose version >/dev/null 2>&1; then
    docker compose "$@"
  elif command -v docker-compose >/dev/null 2>&1; then
    docker-compose "$@"
  else
    echo "ERROR: 未找到 docker compose" >&2
    exit 1
  fi
}

echo "=== .env ==="
grep -E '^(REGISTRY|IMAGE_TAG|GATEWAY_PORT|DATABASE_URL)=' .env 2>/dev/null \
  | sed 's/\(DATABASE_URL=postgresql:\/\/postgres:\)[^@]*/\1***/' || echo "(无 .env)"

echo
echo "=== 容器状态 ==="
compose_cmd -f "$COMPOSE_FILE" ps

echo
echo "=== web 容器 DATABASE_URL ==="
compose_cmd -f "$COMPOSE_FILE" exec -T web printenv DATABASE_URL \
  | sed 's/\(postgresql:\/\/postgres:\)[^@]*/\1***/' || true

echo
echo "=== host.docker.internal 解析 ==="
compose_cmd -f "$COMPOSE_FILE" exec -T web getent hosts host.docker.internal || true

echo
echo "=== 容器内探测 Postgres 5432 ==="
compose_cmd -f "$COMPOSE_FILE" exec -T web sh -c \
  'if command -v nc >/dev/null; then nc -zv -w3 host.docker.internal 5432; elif command -v wget >/dev/null; then wget -qO- --timeout=3 http://host.docker.internal:5432 2>&1 | head -1; else echo "无 nc/wget"; fi' \
  || echo "5432 不可达（常见：Postgres 仅监听 127.0.0.1，需改 listen_addresses + pg_hba）"

echo
echo "=== 宿主机 Postgres 监听 ==="
ss -tlnp 2>/dev/null | grep ':5432' || netstat -tlnp 2>/dev/null | grep ':5432' || echo "(未找到 5432 监听)"

echo
echo "=== web 最近日志 ==="
compose_cmd -f "$COMPOSE_FILE" logs web --tail=40 2>&1 || true

echo
echo "=== HTTP 探活 ==="
curl -sS -o /dev/null -w "GET / => %{http_code}\n" http://127.0.0.1:3000/ || true
curl -sS -o /dev/null -w "GET /api/auth/get-session => %{http_code}\n" http://127.0.0.1:3000/api/auth/get-session || true
curl -sS http://127.0.0.1:3000/api/auth/get-session 2>&1 | head -3 || true
curl -sS -o /dev/null -w "GET /calendar/ => %{http_code}\n" http://127.0.0.1:3000/calendar/ || true
curl -sS -o /dev/null -w "GET /teach-hub/ => %{http_code}\n" http://127.0.0.1:3000/teach-hub/ || true

echo
echo "=== 子应用 API 路由（未登录应 401，404 表示 nginx basePath 未对齐）==="
CAL_CODE="$(curl -sS -o /dev/null -w '%{http_code}' 'http://127.0.0.1:3000/api/calendar/events/?startDate=2026-01-01&endDate=2026-12-31' || echo ERR)"
echo "GET /api/calendar/events/ => ${CAL_CODE}"
if [ "$CAL_CODE" = "404" ]; then
  echo "WARN: calendar API 404 — 检查 deploy/nginx/profile-platform.conf 是否含 proxy_pass .../calendar/api/calendar/"
fi

TH_CODE="$(curl -sS -o /dev/null -w '%{http_code}' 'http://127.0.0.1:3000/api/teach-hub/workspaces/' || echo ERR)"
echo "GET /api/teach-hub/workspaces/ => ${TH_CODE}"
if [ "$TH_CODE" = "404" ]; then
  echo "WARN: teach-hub API 404 — 检查 proxy_pass .../teach-hub/api/teach-hub/"
fi

echo
echo "=== calendar 容器最近日志 ==="
compose_cmd -f "$COMPOSE_FILE" logs calendar --tail=30 2>&1 || true
