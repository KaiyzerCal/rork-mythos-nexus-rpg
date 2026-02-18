module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // If you use reanimated, it MUST be last:
      // 'react-native-reanimated/plugin',
    ],
  };
};


