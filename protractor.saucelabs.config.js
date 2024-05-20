/* eslint-env node */

exports.config = {
  specs: ['test/e2e/**/*.spec.js'],
  // TODO: disable webvital tests for saucelab for now, since browsers in saucelab seems never return webvital metrics
  // exclude: ['test/e2e/12_webvitalsAsCustomEvent/*.spec.js'],
  sauceUser: process.env.SAUCE_USERNAME,
  sauceKey: process.env.SAUCE_ACCESS_KEY,
  sauceBuild: process.env.GITHUB_RUN_NUMBER,
  // See https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/
  multiCapabilities: [
    newSaucelabsCapability('chrome', '124.0', 'macOS 11.00'),
    newSaucelabsCapability('firefox', '125.0', 'macOS 11.00'),
    newSaucelabsCapability('chrome', '124.0', 'macOS 12.00'),
    newSaucelabsCapability('firefox', '125.0', 'macOS 12.00'),
    newSaucelabsCapability('chrome', '124.0', 'macOS 13.00'),
    newSaucelabsCapability('firefox', '125.0', 'macOS 13.00'),
    newSaucelabsCapability('chrome', '124.0', 'macOS 14.00'),
    newSaucelabsCapability('firefox', '125.0', 'macOS 14.00')
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
    name: 'Testing for only INP values',
    'tunnel-identifier': 'github-action-tunnel',
    build: process.env.GITHUB_RUN_NUMBER
  };
}
