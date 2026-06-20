#!/usr/bin/env bash
# TeachHub Mobile — Android release APK（无 Expo prebuild，使用已提交的 android/）
# 参考 talkingTool/.github/workflows/android-apk-release-no-expo.yml
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
MOBILE_DIR="${ROOT_DIR}/apps/teach-hub-mobile"
ANDROID_DIR="${MOBILE_DIR}/android"
SKIP_EXPO_PREBUILD="${SKIP_EXPO_PREBUILD:-1}"

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm not found. Please install pnpm first."
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

cd "${MOBILE_DIR}"

VERSION="${APP_VERSION:-0.1.0}"
BUILD_NO="${EXPO_ANDROID_VERSION_CODE:-1}"

if [ -n "${EXPO_PUBLIC_AUTH_BASE_URL:-}" ] || [ -n "${EXPO_PUBLIC_TEACH_HUB_API_BASE_URL:-}" ]; then
  echo "==> Write .env for release bundle"
  cat > .env <<EOF
EXPO_PUBLIC_AUTH_BASE_URL=${EXPO_PUBLIC_AUTH_BASE_URL:-http://localhost:3000}
EXPO_PUBLIC_TEACH_HUB_API_BASE_URL=${EXPO_PUBLIC_TEACH_HUB_API_BASE_URL:-http://localhost:3002}
EOF
fi

if [ "${SKIP_EXPO_PREBUILD}" = "1" ]; then
  if [ ! -x "${ANDROID_DIR}/gradlew" ]; then
    echo "ERROR: ${ANDROID_DIR}/gradlew not found. Commit android/ or run with SKIP_EXPO_PREBUILD=0 once." >&2
    exit 1
  fi
  echo "==> Skip Expo prebuild (use committed android/)"
else
  if ! command -v npx >/dev/null 2>&1; then
    echo "npx not found. Please install Node.js first."
    exit 1
  fi
  echo "==> Generate Android native project (Expo prebuild)"
  CI=1 npx expo prebuild --platform android --non-interactive --clean
fi

echo "==> Patch Android version (versionName=${VERSION}, versionCode=${BUILD_NO})"
if [[ "$(uname -s)" == "Darwin" ]]; then
  sed -i '' -E "s/versionCode [0-9]+/versionCode ${BUILD_NO}/" "${ANDROID_DIR}/app/build.gradle"
  sed -i '' -E "s/versionName \"[^\"]+\"/versionName \"${VERSION}\"/" "${ANDROID_DIR}/app/build.gradle"
else
  sed -i -E "s/versionCode [0-9]+/versionCode ${BUILD_NO}/" "${ANDROID_DIR}/app/build.gradle"
  sed -i -E "s/versionName \"[^\"]+\"/versionName \"${VERSION}\"/" "${ANDROID_DIR}/app/build.gradle"
fi

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
./gradlew assembleRelease --no-daemon

APK_PATH="${ANDROID_DIR}/app/build/outputs/apk/release/app-release.apk"
if [ ! -f "${APK_PATH}" ]; then
  echo "APK not found: ${APK_PATH}" >&2
  exit 1
fi

DIST_DIR="${MOBILE_DIR}/dist"
mkdir -p "${DIST_DIR}"
OUTPUT_APK="${DIST_DIR}/teach-hub-mobile-${VERSION}+${BUILD_NO}.apk"
cp "${APK_PATH}" "${OUTPUT_APK}"

echo "==> APK output:"
echo "${OUTPUT_APK}"
