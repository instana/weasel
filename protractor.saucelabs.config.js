/* eslint-env node */

exports.config = {
  specs: ['test/e2e/**/*.spec.js'],
  sauceUser: process.env.SAUCE_USERNAME,
  sauceKey: process.env.SAUCE_ACCESS_KEY,
  sauceBuild: process.env.TRAVIS_JOB_NUMBER,
  multiCapabilities: [
    newSaucelabsCapability('internet explorer', '9.0', 'Windows 7'),
    newSaucelabsCapability('internet explorer', '11.103', 'Windows 10'),
    newSaucelabsCapability('MicrosoftEdge', '14.14393', 'Windows 10'),
    newSaucelabsCapability('safari', '9.0', 'OS X 10.11'),
    newSaucelabsCapability('safari', '10.1', 'macOS 10.12'),
    newSaucelabsCapability('safari', '11.0', 'macOS 10.12'),
    newSaucelabsCapability('safari', '11.1', 'macOS 10.13'),
    newSaucelabsCapability('firefox', '48.0', 'Windows 7'),
    newSaucelabsCapability('firefox', '59.0', 'Windows 10'),
    newSaucelabsCapability('chrome', '48.0', 'Windows 10'),
    newSaucelabsCapability('chrome', '54.0', 'OS X 10.11'),
    newSaucelabsCapability('chrome', '65.0', 'OS X 10.11'),
    newSaucelabsCapability('chrome', '76.0', 'OS X 10.11')
  ],
  // Do not allow parallel test execution. Makes the test execution a lot
  // slower, but the setup simpler.
  maxSessions: 1,
  jasmineNodeOpts: {
    defaultTimeoutInterval: 60000
  }
};

function newSaucelabsCapability(browserName, version, platform) {
  return {
    browserName,
    version,
    platform,
    name: 'weasel e2e',
    'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
    build: process.env.TRAVIS_JOB_NUMBER
  };
}
