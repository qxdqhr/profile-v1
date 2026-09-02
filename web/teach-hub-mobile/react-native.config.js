/**
 * pnpm monorepo 下 expo 包经 symlink 解析时，expo/react-native.config.js 可能加载失败，
 * autolinking 会回退到 namespace expo.core，与实际的 expo.modules.ExpoModulesPackage 不一致。
 * 参考 talkingTool android-apk-release-no-expo 流程，在此显式覆盖。
 */
module.exports = {
  dependencies: {
    expo: {
      platforms: {
        android: {
          packageImportPath: 'import expo.modules.ExpoModulesPackage;',
        },
      },
    },
  },
};
