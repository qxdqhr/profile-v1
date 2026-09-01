#!/usr/bin/env bash
# 生产网关栈部署：nginx + web + calendar + teach-hub
# 与 CI（.github/workflows/docker-build-push.yml）共用，同步至 /root/profile-v1/deploy-profile-v1.sh
set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-/root/profile-v1}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.gateway.yml}"
REGISTRY="${REGISTRY:?缺少 REGISTRY}"
IMAGE_TAG="${IMAGE_TAG:?缺少 IMAGE_TAG}"
GATEWAY_PORT="${GATEWAY_PORT:-3000}"

cd "$DEPLOY_DIR"

derive_database_url() {
  if [ -x ./derive-database-url.sh ] && [ -f app.config.yaml ]; then
    ./derive-database-url.sh app.config.yaml
  elif [ -f ./derive-database-url.sh ] && [ -f app.config.yaml ]; then
    bash ./derive-database-url.sh app.config.yaml
  fi
}

# CI 每次部署会重写 .env；保留已有 DATABASE_URL，否则从 app.config 推导
strip_env_value() {
  local v="${1:-}"
  v="${v%\"}"
  v="${v#\"}"
  v="${v%\'}"
  v="${v#\'}"
  printf '%s' "$v"
}

EXISTING_DATABASE_URL=""
EXISTING_MARIADB_ROOT_PASSWORD=""
EXISTING_WORDPRESS_DB_USER=""
EXISTING_WORDPRESS_DB_PASSWORD=""
EXISTING_WORDPRESS_DB_NAME=""
EXISTING_WP_HOLT_PUBLIC_URL=""
if [ -f .env ]; then
  EXISTING_DATABASE_URL="$(strip_env_value "$(grep -E '^DATABASE_URL=' .env | tail -1 | cut -d= -f2- || true)")"
  EXISTING_MARIADB_ROOT_PASSWORD="$(strip_env_value "$(grep -E '^MARIADB_ROOT_PASSWORD=' .env | tail -1 | cut -d= -f2- || true)")"
  EXISTING_WORDPRESS_DB_USER="$(strip_env_value "$(grep -E '^WORDPRESS_DB_USER=' .env | tail -1 | cut -d= -f2- || true)")"
  EXISTING_WORDPRESS_DB_PASSWORD="$(strip_env_value "$(grep -E '^WORDPRESS_DB_PASSWORD=' .env | tail -1 | cut -d= -f2- || true)")"
  EXISTING_WORDPRESS_DB_NAME="$(strip_env_value "$(grep -E '^WORDPRESS_DB_NAME=' .env | tail -1 | cut -d= -f2- || true)")"
  EXISTING_WP_HOLT_PUBLIC_URL="$(strip_env_value "$(grep -E '^WP_HOLT_PUBLIC_URL=' .env | tail -1 | cut -d= -f2- || true)")"
  if [ -z "${EXISTING_WP_HOLT_PUBLIC_URL}" ]; then
    EXISTING_WP_HOLT_PUBLIC_URL="$(strip_env_value "$(grep -E '^WP_PERSONAL_PUBLIC_URL=' .env | tail -1 | sed 's|/wp/personal|/wp/holt|g' | cut -d= -f2- || true)")"
  fi
fi

# 始终以 app.config 推导为准，避免沿用损坏的旧 .env（CI 日志曾出现 port=543）
if [ -x ./ensure-database-url.sh ]; then
  DATABASE_URL="$(./ensure-database-url.sh || true)"
elif [ -f ./ensure-database-url.sh ]; then
  DATABASE_URL="$(bash ./ensure-database-url.sh || true)"
fi
if [ -z "${DATABASE_URL:-}" ]; then
  if [ -n "${EXISTING_DATABASE_URL}" ]; then
    DATABASE_URL="${EXISTING_DATABASE_URL}"
  else
    DATABASE_URL="$(derive_database_url || true)"
  fi
fi

# WordPress / MariaDB：优先沿用服务器已有 .env，其次允许 CI/环境注入
MARIADB_ROOT_PASSWORD="${MARIADB_ROOT_PASSWORD:-${EXISTING_MARIADB_ROOT_PASSWORD}}"
WORDPRESS_DB_USER="${WORDPRESS_DB_USER:-${EXISTING_WORDPRESS_DB_USER}}"
WORDPRESS_DB_PASSWORD="${WORDPRESS_DB_PASSWORD:-${EXISTING_WORDPRESS_DB_PASSWORD}}"
WORDPRESS_DB_NAME="${WORDPRESS_DB_NAME:-${EXISTING_WORDPRESS_DB_NAME:-wp_holt}}"
WP_HOLT_PUBLIC_URL="${WP_HOLT_PUBLIC_URL:-${EXISTING_WP_HOLT_PUBLIC_URL}}"

compose_cmd() {
  if docker compose version >/dev/null 2>&1; then
    docker compose "$@"
  elif command -v docker-compose >/dev/null 2>&1; then
    docker-compose "$@"
  else
    echo "ERROR: 服务器未安装 docker compose / docker-compose，无法启动网关栈" >&2
    exit 1
  fi
}

{
  echo "REGISTRY=${REGISTRY}"
  echo "IMAGE_TAG=${IMAGE_TAG}"
  echo "GATEWAY_PORT=${GATEWAY_PORT}"
  if [ -n "${DATABASE_URL}" ]; then
    # 勿再加引号：旧版 docker-compose 遇 DATABASE_URL=""..."" 会解析失败
    printf 'DATABASE_URL=%s\n' "$(strip_env_value "${DATABASE_URL}")"
  fi
  # 旁路 WordPress（无值则不写，compose 使用镜像默认/占位密码）
  if [ -n "${MARIADB_ROOT_PASSWORD}" ]; then
    printf 'MARIADB_ROOT_PASSWORD=%s\n' "$(strip_env_value "${MARIADB_ROOT_PASSWORD}")"
  fi
  if [ -n "${WORDPRESS_DB_USER}" ]; then
    printf 'WORDPRESS_DB_USER=%s\n' "$(strip_env_value "${WORDPRESS_DB_USER}")"
  fi
  if [ -n "${WORDPRESS_DB_PASSWORD}" ]; then
    printf 'WORDPRESS_DB_PASSWORD=%s\n' "$(strip_env_value "${WORDPRESS_DB_PASSWORD}")"
  fi
  if [ -n "${WORDPRESS_DB_NAME}" ]; then
    printf 'WORDPRESS_DB_NAME=%s\n' "$(strip_env_value "${WORDPRESS_DB_NAME}")"
  fi
  if [ -n "${WP_HOLT_PUBLIC_URL}" ]; then
    printf 'WP_HOLT_PUBLIC_URL=%s\n' "$(strip_env_value "${WP_HOLT_PUBLIC_URL}")"
  fi
} > .env

# 补全 WordPress 缺省键（不覆盖已有非空值；首次上线写入 change-me / 公网 URL）
if [ -x ./ensure-wordpress-env.sh ]; then
  ./ensure-wordpress-env.sh .env
elif [ -f ./ensure-wordpress-env.sh ]; then
  bash ./ensure-wordpress-env.sh .env
fi

echo "=== 部署前磁盘 ==="
df -h /

echo "=== 清理 legacy 单容器 ==="
docker stop my_container 2>/dev/null || true
docker rm my_container 2>/dev/null || true

# docker-compose v1 + 新版 Docker Engine 在 recreate 时会 KeyError: ContainerConfig
# 必须先完整 teardown，再 pull + 全新 up（避免走 recreate 路径）
echo "=== 停止并移除旧网关栈 ==="
compose_cmd -f "$COMPOSE_FILE" down --remove-orphans 2>/dev/null || true
if ids="$(docker ps -aq --filter 'name=profile-v1_')"; then
  # shellcheck disable=SC2086
  docker rm -f $ids 2>/dev/null || true
fi

echo "=== 拉取镜像 tag=${IMAGE_TAG} ==="
compose_cmd -f "$COMPOSE_FILE" pull

echo "=== 启动网关栈（先核心+游戏，WordPress 可失败）==="
# 排除 WordPress：wp_mariadb 崩溃时不应阻断整站 /games
WP_SERVICES="wp_mariadb wordpress_holt"
CORE_SERVICES="$(compose_cmd -f "$COMPOSE_FILE" config --services | grep -vE '^(wp_mariadb|wordpress_holt)$' | tr '\n' ' ')"
# shellcheck disable=SC2086
compose_cmd -f "$COMPOSE_FILE" up -d --remove-orphans $CORE_SERVICES
echo "=== 尝试启动 WordPress 旁路（失败不阻断部署）==="
# shellcheck disable=SC2086
if ! compose_cmd -f "$COMPOSE_FILE" up -d $WP_SERVICES; then
  echo "WARN: WordPress / MariaDB 启动失败，继续部署主站与 /games"
  compose_cmd -f "$COMPOSE_FILE" logs wp_mariadb --tail=80 2>&1 || true
fi

echo "=== 确保 WordPress 数据库存在 ==="
if [ -x ./ensure-wordpress-database.sh ]; then
  ./ensure-wordpress-database.sh .env "$COMPOSE_FILE" || echo "WARN: ensure-wordpress-database 跳过"
elif [ -f ./ensure-wordpress-database.sh ]; then
  bash ./ensure-wordpress-database.sh .env "$COMPOSE_FILE" || echo "WARN: ensure-wordpress-database 跳过"
fi

echo "=== 等待服务就绪 ==="
if [ -x ./wait-gateway-ready.sh ]; then
  GATEWAY_PORT="$GATEWAY_PORT" ./wait-gateway-ready.sh
elif [ -f ./wait-gateway-ready.sh ]; then
  GATEWAY_PORT="$GATEWAY_PORT" bash ./wait-gateway-ready.sh
else
  sleep 12
fi

echo "=== 重载内层 nginx（使 CI scp 的新配置立即生效）==="
compose_cmd -f "$COMPOSE_FILE" exec -T nginx nginx -t
compose_cmd -f "$COMPOSE_FILE" exec -T nginx nginx -s reload

echo "=== 清理悬空镜像 ==="
docker image prune -f || true

echo "=== 网关栈已启动 ==="
compose_cmd -f "$COMPOSE_FILE" ps
df -h /

echo "=== 部署后冒烟测试 ==="
if [ -x ./smoke-test-gateway.sh ]; then
  GATEWAY_PORT="$GATEWAY_PORT" ./smoke-test-gateway.sh
elif [ -f ./smoke-test-gateway.sh ]; then
  GATEWAY_PORT="$GATEWAY_PORT" bash ./smoke-test-gateway.sh
else
  echo "WARN: 缺少 smoke-test-gateway.sh，跳过冒烟测试"
fi
