module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!react-native|@react-native|expo|@expo|react-native-chart-kit)',
  ],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
};