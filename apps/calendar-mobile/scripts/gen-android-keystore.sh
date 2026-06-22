#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
KEYSTORE_PATH="${ROOT_DIR}/apps/calendar-mobile/android/app/keystore.jks"

read -r -p "Keystore 保存路径 [${KEYSTORE_PATH}]: " INPUT
KEYSTORE_PATH="${INPUT:-$KEYSTORE_PATH}"
mkdir -p "$(dirname "${KEYSTORE_PATH}")"

read -r -p "Key alias [calendar]: " KEY_ALIAS
KEY_ALIAS="${KEY_ALIAS:-calendar}"

read -r -s -p "Keystore 密码: " STORE_PASS
echo
read -r -s -p "Key 密码 (回车同 keystore): " KEY_PASS
echo
KEY_PASS="${KEY_PASS:-$STORE_PASS}"

keytool -genkeypair -v \
  -keystore "${KEYSTORE_PATH}" \
  -alias "${KEY_ALIAS}" \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass "${STORE_PASS}" \
  -keypass "${KEY_PASS}" \
  -dname "CN=Profile Calendar, OU=Mobile, O=Profile, L=Local, ST=Local, C=CN"

echo
echo "Keystore: ${KEYSTORE_PATH}"
echo "Alias: ${KEY_ALIAS}"
echo "GitHub Secrets: ANDROID_KEYSTORE_BASE64, ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS, ANDROID_KEY_PASSWORD"
