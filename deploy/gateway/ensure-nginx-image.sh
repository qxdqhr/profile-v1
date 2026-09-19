#!/usr/bin/env bash
# 确保 compose 所需的 nginx 镜像在本地可用。
# 有 REGISTRY 时：只走本地复用 + 阿里云拉取（快速失败，不空转公网镜像站）。
# 无 REGISTRY 时：才尝试 DaoCloud 等公网源。
set -euo pipefail

# shellcheck source=./_lib.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_lib.sh"
cd "$DEPLOY_DIR"

REGISTRY="${REGISTRY:-}"
PULL_TIMEOUT="${PULL_TIMEOUT:-90s}"
# 有阿里云仓时默认不扫公网（避免 TLS 超时拖死部署）；需要时设 ALLOW_PUBLIC_NGINX_MIRROR=1
ALLOW_PUBLIC_NGINX_MIRROR="${ALLOW_PUBLIC_NGINX_MIRROR:-0}"

if [ -n "$REGISTRY" ]; then
  NGINX_IMG="${NGINX_IMG:-${REGISTRY}/library-nginx:1.27-alpine}"
else
  NGINX_IMG="${NGINX_IMG:-docker.m.daocloud.io/library/nginx:1.27-alpine}"
fi

TAG_SUFFIX="nginx:1.27-alpine"

log() { echo "[$(date -u +%H:%M:%S)] $*"; }

retag_if_present() {
  local src="$1"
  if docker image inspect "$src" >/dev/null 2>&1; then
    log "复用本地镜像: ${src} -> ${NGINX_IMG}"
    docker tag "$src" "$NGINX_IMG"
    return 0
  fi
  return 1
}

if docker image inspect "$NGINX_IMG" >/dev/null 2>&1; then
  log "nginx 本地已有: ${NGINX_IMG}"
  exit 0
fi

while IFS= read -r repo_tag; do
  [ -n "$repo_tag" ] || continue
  if retag_if_present "$repo_tag"; then
    exit 0
  fi
done < <(docker images --format '{{.Repository}}:{{.Tag}}' | grep -E "/?${TAG_SUFFIX}$" || true)

retag_if_present "nginx:1.27-alpine" && exit 0
retag_if_present "library/nginx:1.27-alpine" && exit 0
retag_if_present "docker.m.daocloud.io/library/nginx:1.27-alpine" && exit 0

if [ -n "$REGISTRY" ]; then
  log "nginx 拉取阿里云: ${NGINX_IMG}（timeout ${PULL_TIMEOUT}）"
  if timeout "${PULL_TIMEOUT}" docker pull "$NGINX_IMG"; then
    log "nginx 已就绪: ${NGINX_IMG}"
    exit 0
  fi
  if [ "$ALLOW_PUBLIC_NGINX_MIRROR" != "1" ]; then
    log "ERROR: 阿里云 nginx 拉取失败，且未开启 ALLOW_PUBLIC_NGINX_MIRROR=1（拒绝空转公网）" >&2
    exit 1
  fi
  log "WARN: 阿里云失败，ALLOW_PUBLIC_NGINX_MIRROR=1，尝试公网源"
fi

MIRRORS=(
  "docker.m.daocloud.io/library/nginx:1.27-alpine"
  "docker.1ms.run/library/nginx:1.27-alpine"
)

for mirror in "${MIRRORS[@]}"; do
  log "nginx 拉取: ${mirror}（timeout ${PULL_TIMEOUT}）"
  if timeout "${PULL_TIMEOUT}" docker pull "$mirror"; then
    docker tag "$mirror" "$NGINX_IMG"
    log "nginx 已就绪: ${NGINX_IMG}"
    exit 0
  fi
  log "WARN: ${mirror} 失败"
done

log "ERROR: 无法获取 nginx，拒绝继续" >&2
exit 1
