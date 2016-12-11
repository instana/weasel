/* eslint-env node */

exports.config = {
  seleniumAddress: process.env.TRAVIS ? null : 'http://localhost:4444/wd/hub',
  specs: [
    'test/e2e/**/*.spec.js'
  ],

  sauceUser: process.env.SAUCE_USERNAME,
  sauceKey: process.env.SAUCE_ACCESS_KEY,
  capabilities: {
    browserName: 'chrome',
    'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
    build: process.env.TRAVIS_JOB_NUMBER
  }
};
