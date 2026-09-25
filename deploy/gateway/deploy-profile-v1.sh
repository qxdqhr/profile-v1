#!/usr/bin/env bash
# 生产网关栈部署：nginx + web + calendar + teach-hub
# 与 CI（.github/workflows/docker-build-push.yml）共用，同步至 /root/profile-v1/gateway/
set -euo pipefail

# shellcheck source=./_lib.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_lib.sh"
cd "$DEPLOY_DIR"

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.gateway.yml}"
REGISTRY="${REGISTRY:?缺少 REGISTRY}"
IMAGE_TAG="${IMAGE_TAG:?缺少 IMAGE_TAG}"
GATEWAY_PORT="${GATEWAY_PORT:-3000}"

derive_database_url() {
  if [ -x "$GATEWAY_DIR/derive-database-url.sh" ] && [ -f app.config.yaml ]; then
    "$GATEWAY_DIR/derive-database-url.sh" app.config.yaml
  elif [ -f "$GATEWAY_DIR/derive-database-url.sh" ] && [ -f app.config.yaml ]; then
    bash "$GATEWAY_DIR/derive-database-url.sh" app.config.yaml
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
if [ -x "$GATEWAY_DIR/ensure-database-url.sh" ]; then
  DATABASE_URL="$("$GATEWAY_DIR/ensure-database-url.sh" || true)"
elif [ -f "$GATEWAY_DIR/ensure-database-url.sh" ]; then
  DATABASE_URL="$(bash "$GATEWAY_DIR/ensure-database-url.sh" || true)"
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

# timeout(1) 只能执行真实 argv，不能调用 shell function；先解析成数组。
if docker compose version >/dev/null 2>&1; then
  COMPOSE_ARGV=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_ARGV=(docker-compose)
else
  echo "ERROR: 服务器未安装 docker compose / docker-compose，无法启动网关栈" >&2
  exit 1
fi

compose_cmd() {
  "${COMPOSE_ARGV[@]}" "$@"
}

# 用法: compose_timeout 90s -f file.yml pull nginx
compose_timeout() {
  local secs="$1"
  shift
  timeout "${secs}" "${COMPOSE_ARGV[@]}" "$@"
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

# 尽早解析 runtime-modules（决定是否要求 WordPress 环境变量）
MODULES_JSON="${MODULES_JSON:-$DEPLOY_DIR/runtime-modules.json}"
RESOLVE_PY="$GATEWAY_DIR/resolve-runtime-modules.py"
RENDER_PY="$GATEWAY_DIR/render-runtime-nginx.py"
NGINX_FULL="$DEPLOY_DIR/nginx/profile-platform.conf"
NGINX_RUNTIME="$DEPLOY_DIR/nginx/profile-platform.runtime.conf"

if [ ! -f "$MODULES_JSON" ]; then
  echo "ERROR: 缺少 runtime-modules.json: $MODULES_JSON" >&2
  exit 1
fi
if [ ! -f "$RESOLVE_PY" ] || [ ! -f "$RENDER_PY" ]; then
  echo "ERROR: 缺少 resolve/render-runtime-modules 脚本" >&2
  exit 1
fi

# shellcheck disable=SC1091
eval "$(python3 "$RESOLVE_PY" "$MODULES_JSON")"
APP_SERVICES="${RUNTIME_APP_SERVICES:?}"
WP_SERVICES="${RUNTIME_WP_SERVICES:-}"
BASE_SERVICES="nginx"
NGINX_IMG="${NGINX_IMG:-${REGISTRY}/library-nginx:1.27-alpine}"

# 补全 WordPress 非密钥键；仅当 wordpress_holt 启用时强制校验
if [ -n "${WP_SERVICES}" ]; then
  if [ -x "$GATEWAY_DIR/ensure-wordpress-env.sh" ]; then
    "$GATEWAY_DIR/ensure-wordpress-env.sh" .env
  elif [ -f "$GATEWAY_DIR/ensure-wordpress-env.sh" ]; then
    bash "$GATEWAY_DIR/ensure-wordpress-env.sh" .env
  fi
else
  echo "=== runtime-modules: wordpress_holt=false，跳过 ensure-wordpress-env ==="
fi

echo "=== 部署前磁盘 ==="
df -h /

echo "=== 清理 legacy 单容器 ==="
docker stop my_container 2>/dev/null || true
docker rm my_container 2>/dev/null || true

echo "=== 按 runtime-modules 渲染 nginx ==="
python3 "$RENDER_PY" "$MODULES_JSON" "$NGINX_FULL" "$NGINX_RUNTIME"

echo "=== 确保 nginx 本地可用（优先阿里云 ${NGINX_IMG}；失败则中止，不拆现网）==="
if [ -x "$GATEWAY_DIR/ensure-nginx-image.sh" ]; then
  REGISTRY="$REGISTRY" NGINX_IMG="$NGINX_IMG" "$GATEWAY_DIR/ensure-nginx-image.sh"
elif [ -f "$GATEWAY_DIR/ensure-nginx-image.sh" ]; then
  REGISTRY="$REGISTRY" NGINX_IMG="$NGINX_IMG" bash "$GATEWAY_DIR/ensure-nginx-image.sh"
else
  echo "ERROR: 缺少 ensure-nginx-image.sh" >&2
  exit 1
fi

echo "=== 释放 Docker 镜像缓存（仅在磁盘紧张时；保留 nginx）==="
ROOT_USE="$(df -P / | awk 'NR==2 {gsub(/%/,"",$5); print $5}')"
if [ "${ROOT_USE:-0}" -ge 85 ] 2>/dev/null; then
  echo "磁盘使用 ${ROOT_USE}% ≥ 85%，执行清理"
  if [ -x "$GATEWAY_DIR/cleanup-server-disk.sh" ]; then
    "$GATEWAY_DIR/cleanup-server-disk.sh" || true
  elif [ -f "$GATEWAY_DIR/cleanup-server-disk.sh" ]; then
    bash "$GATEWAY_DIR/cleanup-server-disk.sh" || true
  else
    docker image prune -f || true
    docker builder prune -af --filter "until=72h" || true
  fi
  # prune 可能误删 nginx，再确认一次
  REGISTRY="$REGISTRY" NGINX_IMG="$NGINX_IMG" bash "$GATEWAY_DIR/ensure-nginx-image.sh"
else
  echo "磁盘使用 ${ROOT_USE:-?}% < 85%，跳过 image prune（避免强依赖镜像站重拉 nginx/MariaDB）"
  docker container prune -f || true
fi

# docker-compose v1 + 新版 Docker Engine 在 recreate 时会 KeyError: ContainerConfig
# 必须先完整 teardown，再 pull + 全新 up（避免走 recreate 路径）
echo "=== 停止并移除旧网关栈 ==="
compose_timeout 120s -f "$COMPOSE_FILE" down --remove-orphans 2>/dev/null || true
if ids="$(docker ps -aq --filter 'name=profile-v1_')"; then
  # shellcheck disable=SC2086
  docker rm -f $ids 2>/dev/null || true
fi

echo "=== 拉取业务镜像 tag=${IMAGE_TAG} ==="
# shellcheck disable=SC2086
if ! compose_timeout 360s -f "$COMPOSE_FILE" pull $APP_SERVICES; then
  echo "ERROR: 业务镜像拉取超时/失败（360s）" >&2
  exit 1
fi

echo "=== 启动网关栈（仅 runtime-modules 启用的服务 + nginx；--no-deps 防误拉卫星）==="
UP_PULL_ARGS=()
if compose_cmd -f "$COMPOSE_FILE" up --help 2>&1 | grep -q -- '--pull'; then
  UP_PULL_ARGS=(--pull never)
fi
# shellcheck disable=SC2086
if ! compose_timeout 180s -f "$COMPOSE_FILE" up -d --no-deps "${UP_PULL_ARGS[@]}" --remove-orphans $APP_SERVICES $BASE_SERVICES; then
  echo "ERROR: compose up 超时/失败" >&2
  compose_cmd -f "$COMPOSE_FILE" ps || true
  exit 1
fi

if [ -n "${WP_SERVICES}" ]; then
  echo "=== 尝试拉取/启动 WordPress 旁路（短超时，失败不阻断）==="
  # shellcheck disable=SC2086
  if ! compose_timeout 120s -f "$COMPOSE_FILE" pull $WP_SERVICES; then
    echo "WARN: WordPress 镜像拉取失败，继续部署主站与 /games"
  fi
  # shellcheck disable=SC2086
  if ! compose_cmd -f "$COMPOSE_FILE" up -d --no-deps $WP_SERVICES; then
    echo "WARN: WordPress / MariaDB 启动失败，继续部署主站与 /games"
    compose_cmd -f "$COMPOSE_FILE" logs wp_mariadb --tail=80 2>&1 || true
  fi

  echo "=== 确保 WordPress 数据库存在 ==="
  if [ -x "$GATEWAY_DIR/ensure-wordpress-database.sh" ]; then
    "$GATEWAY_DIR/ensure-wordpress-database.sh" .env "$COMPOSE_FILE" || echo "WARN: ensure-wordpress-database 跳过"
  elif [ -f "$GATEWAY_DIR/ensure-wordpress-database.sh" ]; then
    bash "$GATEWAY_DIR/ensure-wordpress-database.sh" .env "$COMPOSE_FILE" || echo "WARN: ensure-wordpress-database 跳过"
  fi
else
  echo "=== runtime-modules: wordpress_holt=false，跳过 WordPress / MariaDB ==="
fi

echo "=== 等待服务就绪 ==="
if [ -x "$GATEWAY_DIR/wait-gateway-ready.sh" ]; then
  GATEWAY_PORT="$GATEWAY_PORT" "$GATEWAY_DIR/wait-gateway-ready.sh"
elif [ -f "$GATEWAY_DIR/wait-gateway-ready.sh" ]; then
  GATEWAY_PORT="$GATEWAY_PORT" bash "$GATEWAY_DIR/wait-gateway-ready.sh"
else
  sleep 12
fi

echo "=== 确保共享 Godot 引擎 /games/godot-engine/ ==="
if [ -x "$GATEWAY_DIR/ensure-godot-shared-engine.sh" ]; then
  "$GATEWAY_DIR/ensure-godot-shared-engine.sh"
elif [ -f "$GATEWAY_DIR/ensure-godot-shared-engine.sh" ]; then
  bash "$GATEWAY_DIR/ensure-godot-shared-engine.sh"
else
  echo "WARN: 缺少 ensure-godot-shared-engine.sh"
fi

echo "=== 为 Godot www 补预压缩 .gz（供 gzip_static；缺文件时不再现场压 38MB wasm）==="
if [ -f "$DEPLOY_DIR/compress-godot-www.sh" ]; then
  for d in games/*/www; do
    [ -d "$d" ] || continue
    if [ -f "$d/index.wasm" ] && [ ! -f "$d/index.wasm.gz" ]; then
      echo "compress $d"
      bash "$DEPLOY_DIR/compress-godot-www.sh" "$d" || echo "WARN: compress failed for $d"
    else
      # gzip_static 要求 .gz mtime ≥ 原文件
      touch "$d"/index.wasm.gz "$d"/index.pck.gz "$d"/index.js.gz 2>/dev/null || true
    fi
  done
else
  echo "WARN: 缺少 compress-godot-www.sh，跳过预压缩"
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
if [ -x "$GATEWAY_DIR/smoke-test-gateway.sh" ]; then
  GATEWAY_PORT="$GATEWAY_PORT" \
    RUNTIME_ENABLED_CSV="${RUNTIME_ENABLED_CSV:-}" \
    MODULES_JSON="$MODULES_JSON" \
    "$GATEWAY_DIR/smoke-test-gateway.sh"
elif [ -f "$GATEWAY_DIR/smoke-test-gateway.sh" ]; then
  GATEWAY_PORT="$GATEWAY_PORT" \
    RUNTIME_ENABLED_CSV="${RUNTIME_ENABLED_CSV:-}" \
    MODULES_JSON="$MODULES_JSON" \
    bash "$GATEWAY_DIR/smoke-test-gateway.sh"
else
  echo "WARN: 缺少 smoke-test-gateway.sh，跳过冒烟测试"
fi
