#!/usr/bin/env bash
# TeachHub Mobile — Android release APK（Expo prebuild + Gradle 签名）
# 参考 talkingTool/scripts/android-local-build.sh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
MOBILE_DIR="${ROOT_DIR}/apps/teach-hub-mobile"
ANDROID_DIR="${MOBILE_DIR}/android"

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm not found. Please install pnpm first."
  exit 1
fi

if ! command -v npx >/dev/null 2>&1; then
  echo "npx not found. Please install Node.js first."
  exit 1
fi

if ! command -v java >/dev/null 2>&1; then
  echo "Java not found. Please install JDK 17."
  exit 1
fi

echo "==> Install monorepo dependencies"
cd "${ROOT_DIR}"
pnpm install --frozen-lockfile

echo "==> Typecheck TeachHub mobile"
pnpm --filter @profile/teach-hub-mobile build

echo "==> Generate Android native project (Expo prebuild)"
cd "${MOBILE_DIR}"
CI=1 npx expo prebuild --platform android --non-interactive --clean

if [ -z "${ANDROID_KEYSTORE_BASE64:-}" ]; then
  echo "ANDROID_KEYSTORE_BASE64 not set. Release will use debug keystore."
  echo "Set ANDROID_KEYSTORE_BASE64 / ANDROID_KEYSTORE_PASSWORD / ANDROID_KEY_ALIAS / ANDROID_KEY_PASSWORD for signed release."
else
  if [ -z "${ANDROID_KEYSTORE_PASSWORD:-}" ] || [ -z "${ANDROID_KEY_ALIAS:-}" ] || [ -z "${ANDROID_KEY_PASSWORD:-}" ]; then
    echo "Missing keystore env vars. Need ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS, ANDROID_KEY_PASSWORD."
    exit 1
  fi

  echo "==> Configure Android keystore"
  mkdir -p "${ANDROID_DIR}/app"
  echo "${ANDROID_KEYSTORE_BASE64}" | base64 --decode > "${ANDROID_DIR}/app/keystore.jks"
  cat > "${ANDROID_DIR}/keystore.properties" <<EOF
storeFile=keystore.jks
storePassword=${ANDROID_KEYSTORE_PASSWORD}
keyAlias=${ANDROID_KEY_ALIAS}
keyPassword=${ANDROID_KEY_PASSWORD}
EOF
fi

echo "==> Build Android APK (release)"
cd "${ANDROID_DIR}"
chmod +x ./gradlew
NODE_ENV=production ./gradlew assembleRelease --no-daemon

APK_PATH="${ANDROID_DIR}/app/build/outputs/apk/release/app-release.apk"
if [ ! -f "${APK_PATH}" ]; then
  echo "APK not found: ${APK_PATH}" >&2
  exit 1
fi

DIST_DIR="${MOBILE_DIR}/dist"
mkdir -p "${DIST_DIR}"
VERSION="${APP_VERSION:-0.1.0}"
BUILD_NO="${EXPO_ANDROID_VERSION_CODE:-local}"
OUTPUT_APK="${DIST_DIR}/teach-hub-mobile-${VERSION}+${BUILD_NO}.apk"
cp "${APK_PATH}" "${OUTPUT_APK}"

echo "==> APK output:"
echo "${OUTPUT_APK}"
