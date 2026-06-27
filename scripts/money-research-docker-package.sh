#!/usr/bin/env bash
# Money Research 整体打包：Web Docker 镜像
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IMAGE_TAG="${1:-local}"
PLATFORM="${PLATFORM:-linux/amd64}"
BUILD_DOCKER="${BUILD_DOCKER:-1}"
SEND_FEISHU="${SEND_FEISHU:-0}"

usage() {
  cat <<'EOF'
用法: bash scripts/money-research-docker-package.sh [IMAGE_TAG]

环境变量:
  BUILD_DOCKER=0   跳过 Docker 镜像
  SEND_FEISHU=1    打包完成后发送飞书通知（需 FEISHU_WEBHOOK_URL）
EOF
}

if [ "${1:-}" = "-h" ] || [ "${1:-}" = "--help" ]; then
  usage
  exit 0
fi

cd "${ROOT_DIR}"

if [ "${BUILD_DOCKER}" = "1" ]; then
  echo "==> Build Money Research Docker image (tag: ${IMAGE_TAG})"
  docker buildx build --platform "${PLATFORM}" \
    -f apps/money-research/Dockerfile \
    -t "qhr-profile-money-research:${IMAGE_TAG}" \
    --load .
  echo "==> Docker image ready: qhr-profile-money-research:${IMAGE_TAG}"
else
  echo "==> Skip Docker (BUILD_DOCKER=0)"
fi

echo ""
echo "==> Money Research package summary"
echo "Docker image : qhr-profile-money-research:${IMAGE_TAG}"

if [ "${SEND_FEISHU}" = "1" ] || [ -n "${FEISHU_WEBHOOK_URL:-}" ] || [ -n "${CI_FEISHU_WEBHOOK_URL:-}" ]; then
  echo "==> Send Feishu notification"
  CI_NOTIFY_STATUS=success \
  CI_IMAGE_TAG="money-research:${IMAGE_TAG}" \
  GITHUB_WORKFLOW="${GITHUB_WORKFLOW:-Money Research Package}" \
  GITHUB_REPOSITORY="${GITHUB_REPOSITORY:-local/money-research}" \
  GITHUB_RUN_NUMBER="${GITHUB_RUN_NUMBER:-0}" \
  GITHUB_RUN_ID="${GITHUB_RUN_ID:-0}" \
  GITHUB_EVENT_NAME="${GITHUB_EVENT_NAME:-local}" \
  GITHUB_REF_NAME="${GITHUB_REF_NAME:-${IMAGE_TAG}}" \
  GITHUB_SHA="${GITHUB_SHA:-local}" \
  GITHUB_ACTOR="${GITHUB_ACTOR:-local}" \
  GITHUB_SERVER_URL="${GITHUB_SERVER_URL:-https://github.com}" \
  node scripts/send-ci-feishu-notify.mjs
fi
