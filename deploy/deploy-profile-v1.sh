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
EXISTING_DATABASE_URL=""
if [ -f .env ]; then
  EXISTING_DATABASE_URL="$(grep -E '^DATABASE_URL=' .env | tail -1 | cut -d= -f2- || true)"
fi
if [ -z "${DATABASE_URL:-}" ] && [ -z "${EXISTING_DATABASE_URL}" ]; then
  DATABASE_URL="$(derive_database_url || true)"
else
  DATABASE_URL="${DATABASE_URL:-${EXISTING_DATABASE_URL}}"
fi

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
    echo "DATABASE_URL=${DATABASE_URL}"
  fi
} > .env

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

echo "=== 启动网关栈 ==="
compose_cmd -f "$COMPOSE_FILE" up -d --remove-orphans

echo "=== 清理悬空镜像 ==="
docker image prune -f || true

echo "=== 网关栈已启动 ==="
compose_cmd -f "$COMPOSE_FILE" ps
df -h /
