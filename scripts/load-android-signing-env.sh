#!/usr/bin/env bash
# 加载 Android release 签名环境变量（TeachHub / Calendar Mobile 共用同一套 ANDROID_*）。
# 优先级：已 export 的变量 > config/android-signing.env > apps/teach-hub-mobile/teach-hub-release.jks
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ANDROID_SIGNING_ENV_FILE:-${ROOT_DIR}/config/android-signing.env}"
DEFAULT_JKS="${ROOT_DIR}/apps/teach-hub-mobile/teach-hub-release.jks"

if [ -f "${ENV_FILE}" ]; then
  # shellcheck disable=SC1090
  set -a
  source "${ENV_FILE}"
  set +a
  echo "==> Loaded Android signing env from ${ENV_FILE}"
fi

if [ -z "${ANDROID_KEYSTORE_BASE64:-}" ] && [ -f "${DEFAULT_JKS}" ]; then
  if [ -n "${ANDROID_KEYSTORE_PASSWORD:-}" ] && [ -n "${ANDROID_KEY_ALIAS:-}" ] && [ -n "${ANDROID_KEY_PASSWORD:-}" ]; then
    echo "==> Encode local keystore: ${DEFAULT_JKS}"
    if base64 --help 2>/dev/null | grep -q GNU; then
      ANDROID_KEYSTORE_BASE64="$(base64 -w 0 "${DEFAULT_JKS}")"
    else
      ANDROID_KEYSTORE_BASE64="$(base64 -i "${DEFAULT_JKS}")"
    fi
    export ANDROID_KEYSTORE_BASE64
  fi
fi
