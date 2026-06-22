#!/usr/bin/env bash
# 将 ANDROID_* 写入指定 android/ 目录的 keystore.properties + app/keystore.jks
# 用法: setup-android-release-keystore.sh /path/to/apps/foo-mobile/android
set -euo pipefail

ANDROID_DIR="${1:?android dir required}"

if [ -z "${ANDROID_KEYSTORE_BASE64:-}" ]; then
  echo "ANDROID_KEYSTORE_BASE64 not set. Release will use debug keystore."
  echo "Copy config/android-signing.env.example → config/android-signing.env (与 TeachHub 共用 ANDROID_*)。"
  exit 0
fi

if [ -z "${ANDROID_KEYSTORE_PASSWORD:-}" ] || [ -z "${ANDROID_KEY_ALIAS:-}" ] || [ -z "${ANDROID_KEY_PASSWORD:-}" ]; then
  echo "Missing keystore env vars. Need ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS, ANDROID_KEY_PASSWORD." >&2
  exit 1
fi

echo "==> Configure Android keystore (${ANDROID_DIR})"
mkdir -p "${ANDROID_DIR}/app"
echo "${ANDROID_KEYSTORE_BASE64}" | base64 --decode > "${ANDROID_DIR}/app/keystore.jks"
cat > "${ANDROID_DIR}/keystore.properties" <<EOF
storeFile=keystore.jks
storePassword=${ANDROID_KEYSTORE_PASSWORD}
keyAlias=${ANDROID_KEY_ALIAS}
keyPassword=${ANDROID_KEY_PASSWORD}
EOF
