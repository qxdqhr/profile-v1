#!/usr/bin/env bash
# 确保 compose 所需的 nginx 镜像在本地可用（国内镜像优先，避免拆栈后 Docker Hub TLS 超时）。
# 用法（在 deploy 目录或已 cd 到 DEPLOY_DIR）:
#   bash ensure-nginx-image.sh
# 环境变量:
#   NGINX_IMG  目标 tag（默认 docker.m.daocloud.io/library/nginx:1.27-alpine）
#   PULL_TIMEOUT  单次拉取超时（默认 90s）
set -euo pipefail

NGINX_IMG="${NGINX_IMG:-docker.m.daocloud.io/library/nginx:1.27-alpine}"
PULL_TIMEOUT="${PULL_TIMEOUT:-90s}"
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

# 任意仓库前缀的同名 tag（曾用 docker.io / 其它镜像站拉过）
while IFS= read -r repo_tag; do
  [ -n "$repo_tag" ] || continue
  if retag_if_present "$repo_tag"; then
    exit 0
  fi
done < <(docker images --format '{{.Repository}}:{{.Tag}}' | grep -E "/?${TAG_SUFFIX}$" || true)

retag_if_present "nginx:1.27-alpine" && exit 0
retag_if_present "library/nginx:1.27-alpine" && exit 0

MIRRORS=(
  "docker.m.daocloud.io/library/nginx:1.27-alpine"
  "docker.1ms.run/library/nginx:1.27-alpine"
  "docker.xuanyuan.me/library/nginx:1.27-alpine"
  "dockerproxy.net/library/nginx:1.27-alpine"
)

attempt=0
for mirror in "${MIRRORS[@]}"; do
  attempt=$((attempt + 1))
  echo "nginx 拉取尝试 ${attempt}/${#MIRRORS[@]}: ${mirror}（timeout ${PULL_TIMEOUT}）"
  if timeout "${PULL_TIMEOUT}" docker pull "$mirror"; then
    if [ "$mirror" != "$NGINX_IMG" ]; then
      docker tag "$mirror" "$NGINX_IMG"
    fi
    echo "nginx 已就绪: ${NGINX_IMG}"
    exit 0
  fi
  echo "WARN: ${mirror} 拉取失败，换下一源"
done

echo "WARN: 国内镜像均失败，最后尝试 docker.io/library/nginx:1.27-alpine（短超时）"
if timeout "${PULL_TIMEOUT}" docker pull nginx:1.27-alpine; then
  docker tag nginx:1.27-alpine "$NGINX_IMG"
  echo "nginx 已就绪（来自 docker.io）: ${NGINX_IMG}"
  exit 0
fi

echo "ERROR: 无法获取 nginx:1.27-alpine，拒绝继续（避免 down 后网关起不来）" >&2
exit 1
