/* eslint-env node */

if (process.env.TRAVIS) {
  exports.config = {
    specs: ['test/e2e/**/*.spec.js'],
    sauceUser: process.env.SAUCE_USERNAME,
    sauceKey: process.env.SAUCE_ACCESS_KEY,
    multiCapabilities: [
      newSaucelabsCapability('chrome', 'OS X 10.11', '54.0'),
      newSaucelabsCapability('internet explorer', '11.103', 'Windows 10'),
      newSaucelabsCapability('internet explorer', '8.0', 'Windows 7'),
      newSaucelabsCapability('internet explorer', '6.0', 'Windows XP'),
      newSaucelabsCapability('firefox', '45.0', 'Linux'),
      newSaucelabsCapability('MicrosoftEdge', '14.14393', 'Windows 10')
    ],
    // Do not allow parallel test execution. Makes the test execution a lot
    // slower, but the setup simpler.
    maxSessions: 1
  };
} else {
  exports.config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: ['test/e2e/**/*.spec.js']
  };
}


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
