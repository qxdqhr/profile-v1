#!/usr/bin/env bash
# CI runner：从 Docker Hub 拉基础镜像并推到阿里云个人版，供服务器拉取（避开国内 Hub/DaoCloud TLS）。
# 用法: REGISTRY=... bash scripts/ci-mirror-base-images.sh
set -euo pipefail

REGISTRY="${REGISTRY:?REGISTRY is required}"
NGINX_DST="${REGISTRY}/library-nginx:1.27-alpine"

echo "=== Mirror nginx:1.27-alpine -> ${NGINX_DST} ==="
docker pull nginx:1.27-alpine
docker tag nginx:1.27-alpine "$NGINX_DST"
docker push "$NGINX_DST"
echo "OK: ${NGINX_DST}"
