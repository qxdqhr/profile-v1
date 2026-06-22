#!/usr/bin/env bash
# TeachHub 整体打包：Web Docker 镜像 + RN Android APK
# 与 CI docker-build-push 对齐；本地可跳过 Android 或 Docker。
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IMAGE_TAG="${1:-local}"
PLATFORM="${PLATFORM:-linux/amd64}"
BUILD_DOCKER="${BUILD_DOCKER:-1}"
BUILD_ANDROID="${BUILD_ANDROID:-1}"
SEND_FEISHU="${SEND_FEISHU:-0}"

APK_FILE=""
APK_RELEASE_URL=""
APK_DOWNLOAD_URL=""

usage() {
  cat <<'EOF'
用法: bash scripts/teach-hub-docker-package.sh [IMAGE_TAG]

环境变量:
  BUILD_DOCKER=0          跳过 Docker 镜像
  BUILD_ANDROID=0         跳过 RN Android APK
  SEND_FEISHU=1           打包完成后发送飞书通知（需 FEISHU_WEBHOOK_URL）
  TEACH_HUB_APK_RELEASE_URL   GitHub Release 页面链接（写入输出与飞书）
  TEACH_HUB_APK_DOWNLOAD_URL  APK 直链下载地址（写入输出与飞书）
  APP_VERSION             Android 版本名（默认 0.1.0）
  EXPO_ANDROID_VERSION_CODE  Android versionCode（默认 local）
  EXPO_PUBLIC_AUTH_BASE_URL / EXPO_PUBLIC_TEACH_HUB_API_BASE_URL  RN 构建 API 地址
  ANDROID_SIGNING_ENV_FILE    默认 config/android-signing.env（TeachHub / Calendar 共用）
EOF
}

if [ "${1:-}" = "-h" ] || [ "${1:-}" = "--help" ]; then
  usage
  exit 0
fi

cd "${ROOT_DIR}"

if [ "${BUILD_DOCKER}" = "1" ]; then
  echo "==> [1/2] Build TeachHub Docker image (tag: ${IMAGE_TAG})"
  docker buildx build --platform "${PLATFORM}" \
    -f apps/teach-hub/Dockerfile \
    -t "qhr-profile-teach-hub:${IMAGE_TAG}" \
    --load .
  echo "==> Docker image ready: qhr-profile-teach-hub:${IMAGE_TAG}"
else
  echo "==> [1/2] Skip Docker (BUILD_DOCKER=0)"
fi

if [ "${BUILD_ANDROID}" = "1" ]; then
  echo "==> [2/2] Build TeachHub Mobile Android APK"
  # shellcheck source=/dev/null
  source "${ROOT_DIR}/scripts/load-android-signing-env.sh"
  bash apps/teach-hub-mobile/scripts/android-release-build.sh
  APK_FILE="$(ls -t "${ROOT_DIR}"/apps/teach-hub-mobile/dist/*.apk 2>/dev/null | head -1 || true)"
  if [ -z "${APK_FILE}" ] || [ ! -f "${APK_FILE}" ]; then
    echo "ERROR: Android APK not found under apps/teach-hub-mobile/dist/" >&2
    exit 1
  fi
  if [ -n "${TEACH_HUB_APK_RELEASE_URL:-}" ]; then
    APK_RELEASE_URL="${TEACH_HUB_APK_RELEASE_URL}"
  fi
  if [ -n "${TEACH_HUB_APK_DOWNLOAD_URL:-}" ]; then
    APK_DOWNLOAD_URL="${TEACH_HUB_APK_DOWNLOAD_URL}"
  elif [ -z "${APK_RELEASE_URL}" ]; then
    APK_DOWNLOAD_URL="file://${APK_FILE}"
  fi
else
  echo "==> [2/2] Skip Android (BUILD_ANDROID=0)"
fi

echo ""
echo "==> TeachHub package summary"
echo "Docker image : qhr-profile-teach-hub:${IMAGE_TAG}"
if [ -n "${APK_FILE}" ]; then
  echo "Android APK  : ${APK_FILE}"
  if [ -n "${APK_RELEASE_URL}" ]; then
    echo "Release page : ${APK_RELEASE_URL}"
  fi
  if [ -n "${APK_DOWNLOAD_URL}" ]; then
    echo "APK download : ${APK_DOWNLOAD_URL}"
  fi
fi

if [ "${SEND_FEISHU}" = "1" ] || [ -n "${FEISHU_WEBHOOK_URL:-}" ] || [ -n "${CI_FEISHU_WEBHOOK_URL:-}" ]; then
  echo "==> Send Feishu notification"
  CI_NOTIFY_STATUS=success \
  CI_IMAGE_TAG="teach-hub:${IMAGE_TAG}" \
  CI_TEACH_HUB_APK_RELEASE_URL="${APK_RELEASE_URL:-}" \
  CI_TEACH_HUB_APK_DOWNLOAD_URL="${APK_DOWNLOAD_URL:-}" \
  GITHUB_WORKFLOW="${GITHUB_WORKFLOW:-TeachHub Package}" \
  GITHUB_REPOSITORY="${GITHUB_REPOSITORY:-local/teach-hub}" \
  GITHUB_RUN_NUMBER="${GITHUB_RUN_NUMBER:-0}" \
  GITHUB_RUN_ID="${GITHUB_RUN_ID:-0}" \
  GITHUB_EVENT_NAME="${GITHUB_EVENT_NAME:-local}" \
  GITHUB_REF_NAME="${GITHUB_REF_NAME:-${IMAGE_TAG}}" \
  GITHUB_SHA="${GITHUB_SHA:-local}" \
  GITHUB_ACTOR="${GITHUB_ACTOR:-local}" \
  GITHUB_SERVER_URL="${GITHUB_SERVER_URL:-https://github.com}" \
  node scripts/send-ci-feishu-notify.mjs
fi
