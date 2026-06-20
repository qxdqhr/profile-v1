#!/usr/bin/env bash
# 本地打包 TeachHub Web 子应用 Docker 镜像（与 CI docker-build-push 对齐）
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IMAGE_TAG="${1:-local}"
PLATFORM="${PLATFORM:-linux/amd64}"

cd "${ROOT_DIR}"

echo "==> Build TeachHub Docker image (tag: ${IMAGE_TAG})"
docker buildx build --platform "${PLATFORM}" \
  -f apps/teach-hub/Dockerfile \
  -t "qhr-profile-teach-hub:${IMAGE_TAG}" \
  --load .

echo "==> Image ready: qhr-profile-teach-hub:${IMAGE_TAG}"
