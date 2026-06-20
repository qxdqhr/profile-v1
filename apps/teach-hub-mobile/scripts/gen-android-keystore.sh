#!/usr/bin/env bash
# 首次为 TeachHub Mobile 创建 Android release 签名证书。
# 生成后把输出填入 GitHub Secrets（见 README / workflow 注释）。
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
KEYSTORE_PATH="${ROOT_DIR}/apps/teach-hub-mobile/teach-hub-release.jks"
ALIAS_NAME="${1:-teachhub}"

echo "==> Generate keystore: ${KEYSTORE_PATH}"
echo "==> You will be prompted for keystore password / key password / organization info."
keytool -genkeypair -v \
  -keystore "${KEYSTORE_PATH}" \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias "${ALIAS_NAME}"

echo ""
echo "==> Prepare GitHub Secrets (copy these values)"
echo "ANDROID_KEYSTORE_BASE64="
if base64 --help 2>/dev/null | grep -q GNU; then
  base64 -w 0 "${KEYSTORE_PATH}"
else
  base64 -i "${KEYSTORE_PATH}"
fi
echo ""
echo "ANDROID_KEYSTORE_PASSWORD= (keystore 密码)"
echo "ANDROID_KEY_ALIAS=${ALIAS_NAME}"
echo "ANDROID_KEY_PASSWORD= (key 密码)"
