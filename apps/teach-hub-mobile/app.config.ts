import type { ConfigContext, ExpoConfig } from 'expo/config';

const APP_VERSION = process.env.APP_VERSION?.trim() || '0.1.0';
const ANDROID_VERSION_CODE = Number.parseInt(
  process.env.EXPO_ANDROID_VERSION_CODE || '1',
  10,
);

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'TeachHub',
  slug: 'teach-hub-mobile',
  version: APP_VERSION,
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#f8fafc',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.profile.teachhub',
    buildNumber: process.env.EXPO_IOS_BUILD_NUMBER || APP_VERSION,
  },
  android: {
    package: 'com.profile.teachhub',
    versionCode: Number.isFinite(ANDROID_VERSION_CODE) ? ANDROID_VERSION_CODE : 1,
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#f8fafc',
    },
  },
  extra: {
    authBaseUrl:
      process.env.EXPO_PUBLIC_AUTH_BASE_URL?.replace(/\/+$/, '') || 'http://localhost:3000',
    teachHubApiBaseUrl:
      process.env.EXPO_PUBLIC_TEACH_HUB_API_BASE_URL?.replace(/\/+$/, '') ||
      'http://localhost:3002',
  },
  plugins: ['./plugins/withAndroidReleaseSigning.js'],
});
