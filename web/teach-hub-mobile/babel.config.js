function withoutWorkletsPlugin(plugins) {
  return plugins.filter((plugin) => {
    if (plugin === 'react-native-worklets/plugin') return false;
    if (Array.isArray(plugin) && plugin[0] === 'react-native-worklets/plugin') return false;
    return true;
  });
}

module.exports = function (api) {
  api.cache(true);
  const nativewind = require('nativewind/babel')();
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
    ],
    // nativewind/babel 含 worklets/plugin（Reanimated 4+），RN 0.76 + Reanimated 3 需剔除
    plugins: [
      ...withoutWorkletsPlugin(nativewind.plugins),
      'react-native-reanimated/plugin',
    ],
  };
};
