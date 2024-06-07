/* eslint-env node */

const config = {
  testEnvironment: 'jsdom',
  globals: {
    DEBUG: true
  },
  moduleNameMapper: {
    '^@lib/(.*)$': '<rootDir>/lib/$1'
  }
};

module.exports = config;
