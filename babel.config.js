module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@components': './src/components',
          '@screens': './src/screens',
          '@utils': './src/utils',
          '@constants': './src/constants',
          '@store': './src/store',
          '@slices': './src/slices',
          '@assets': './src/assets',
          '@api': './src/api',
          '@hooks': './src/hooks',
          '@config': './src/config',
          '@interfaces': './src/interfaces',
          '@context': './src/context',
        },
      },
    ],
    ['module:react-native-dotenv'],
  ],
};
