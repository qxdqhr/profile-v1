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

# 补全 WordPress 非密钥键；密码缺失或弱口令时 ensure-wordpress-env.sh 会失败
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

echo "=== 释放 Docker 镜像缓存（仅在磁盘紧张时）==="
ROOT_USE="$(df -P / | awk 'NR==2 {gsub(/%/,"",$5); print $5}')"
if [ "${ROOT_USE:-0}" -ge 85 ] 2>/dev/null; then
  echo "磁盘使用 ${ROOT_USE}% ≥ 85%，执行清理"
  if [ -x ./cleanup-server-disk.sh ]; then
    ./cleanup-server-disk.sh || true
  elif [ -f ./cleanup-server-disk.sh ]; then
    bash ./cleanup-server-disk.sh || true
  else
    docker image prune -af || true
    docker builder prune -af || true
  fi
else
  echo "磁盘使用 ${ROOT_USE:-?}% < 85%，跳过 image prune（避免强依赖 DaoCloud 重拉 nginx/MariaDB）"
  docker container prune -f || true
fi

# DaoCloud 公网 TLS 不稳：阿里云业务镜像必须拉成功；nginx/WP 失败则沿用本地层
APP_SERVICES="web calendar teach_hub showmasterpiece money_research node_notes"
BASE_SERVICES="nginx"
WP_SERVICES="wp_mariadb wordpress_holt"

echo "=== 拉取业务镜像 tag=${IMAGE_TAG} ==="
# shellcheck disable=SC2086
compose_cmd -f "$COMPOSE_FILE" pull $APP_SERVICES

echo "=== 尝试准备 nginx 镜像（短超时；失败用本地/官方源）==="
NGINX_IMG="docker.m.daocloud.io/library/nginx:1.27-alpine"
if docker image inspect "$NGINX_IMG" >/dev/null 2>&1; then
  echo "nginx 本地已有，跳过拉取"
else
  if ! timeout 90s compose_cmd -f "$COMPOSE_FILE" pull $BASE_SERVICES; then
    echo "WARN: DaoCloud nginx 拉取超时/失败，尝试 docker.io"
    if timeout 90s docker pull nginx:1.27-alpine; then
      docker tag nginx:1.27-alpine "$NGINX_IMG"
    else
      echo "WARN: nginx 仍不可用，up 可能失败"
    fi
  fi
fi

echo "=== 启动网关栈（先核心；游戏静态由平台 nginx 托管，WordPress 可失败）==="
# shellcheck disable=SC2086
compose_cmd -f "$COMPOSE_FILE" up -d --remove-orphans $APP_SERVICES $BASE_SERVICES
echo "=== 尝试拉取/启动 WordPress 旁路（短超时，失败不阻断）==="
# shellcheck disable=SC2086
if ! timeout 90s compose_cmd -f "$COMPOSE_FILE" pull $WP_SERVICES; then
  echo "WARN: WordPress 镜像拉取失败，继续部署主站与 /games"
fi
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
