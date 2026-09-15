#!/usr/bin/env bash
# 确保 compose 所需的 nginx 镜像在本地可用。
# 优先：阿里云 REGISTRY/library-nginx（由 CI mirror）；其次本地已有层；最后才试公网镜像站。
# 用法（DEPLOY_DIR）:
#   REGISTRY=... bash ensure-nginx-image.sh
set -euo pipefail

REGISTRY="${REGISTRY:-}"
PULL_TIMEOUT="${PULL_TIMEOUT:-90s}"

if [ -n "$REGISTRY" ]; then
  NGINX_IMG="${NGINX_IMG:-${REGISTRY}/library-nginx:1.27-alpine}"
else
  NGINX_IMG="${NGINX_IMG:-docker.m.daocloud.io/library/nginx:1.27-alpine}"
fi

TAG_SUFFIX="nginx:1.27-alpine"

retag_if_present() {
  local src="$1"
  if docker image inspect "$src" >/dev/null 2>&1; then
    echo "复用本地镜像: ${src} -> ${NGINX_IMG}"
    docker tag "$src" "$NGINX_IMG"
    return 0
  fi
  return 1
}

if docker image inspect "$NGINX_IMG" >/dev/null 2>&1; then
  echo "nginx 本地已有: ${NGINX_IMG}"
  exit 0
fi

# 任意仓库前缀的同名 tag
while IFS= read -r repo_tag; do
  [ -n "$repo_tag" ] || continue
  if retag_if_present "$repo_tag"; then
    exit 0
  fi
done < <(docker images --format '{{.Repository}}:{{.Tag}}' | grep -E "/?${TAG_SUFFIX}$" || true)

retag_if_present "nginx:1.27-alpine" && exit 0
retag_if_present "library/nginx:1.27-alpine" && exit 0
retag_if_present "docker.m.daocloud.io/library/nginx:1.27-alpine" && exit 0

# 1) 阿里云（与业务镜像同仓，服务器已登录）
if [ -n "$REGISTRY" ]; then
  echo "nginx 拉取: ${NGINX_IMG}（阿里云，timeout ${PULL_TIMEOUT}）"
  if timeout "${PULL_TIMEOUT}" docker pull "$NGINX_IMG"; then
    echo "nginx 已就绪: ${NGINX_IMG}"
    exit 0
  fi
  echo "WARN: 阿里云 nginx 拉取失败，尝试公网镜像站"
fi

MIRRORS=(
  "docker.m.daocloud.io/library/nginx:1.27-alpine"
  "docker.1ms.run/library/nginx:1.27-alpine"
  "docker.xuanyuan.me/library/nginx:1.27-alpine"
)

for mirror in "${MIRRORS[@]}"; do
  echo "nginx 拉取: ${mirror}（timeout ${PULL_TIMEOUT}）"
  if timeout "${PULL_TIMEOUT}" docker pull "$mirror"; then
    docker tag "$mirror" "$NGINX_IMG"
    echo "nginx 已就绪: ${NGINX_IMG}"
    exit 0
  fi
  echo "WARN: ${mirror} 失败"
done

echo "WARN: 最后尝试 docker.io（短超时）"
if timeout 60s docker pull nginx:1.27-alpine; then
  docker tag nginx:1.27-alpine "$NGINX_IMG"
  echo "nginx 已就绪（docker.io）: ${NGINX_IMG}"
  exit 0
fi

echo "ERROR: 无法获取 nginx:1.27-alpine，拒绝继续（避免 down 后网关起不来）" >&2
exit 1
