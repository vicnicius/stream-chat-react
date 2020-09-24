module.exports = {
  verbose: true,
  maxConcurrency: 15,
  globalSetup: './jest-global-setup.js',
  testRegex: [
    /**
     * If you want to test single file, mention it here
     * e.g.,
     * "src/components/ChannelList/__tests__/ChannelList.test.js",
     * "src/components/MessageList/__tests__/MessageList.test.js"
     */
  ],
  transformIgnorePatterns: [],
  testPathIgnorePatterns: ['/node_modules/', '/examples/', '__snapshots__'],
  transform: {
    '^.+\\.(js|jsx)?$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/assetsTransformer.js',
    'mock-builders(.*)$': '<rootDir>/src/mock-builders$1',
  },
  setupFiles: ['core-js'],
};
