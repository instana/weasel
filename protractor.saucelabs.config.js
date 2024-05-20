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
    newSaucelabsCapability('chrome', '124.0', 'OS X 10.11'),
    newSaucelabsCapability('chrome', '124.0', 'macOS'),
    newSaucelabsCapability('chrome', '124.0', 'Windows 7'),
    newSaucelabsCapability('chrome', '124.0', 'Windows 10'),
    newSaucelabsCapability('chrome', '124.0', 'Windows 11')
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
    name: 'Testing for only INP values in chrome 124',
    'tunnel-identifier': 'github-action-tunnel',
    build: process.env.GITHUB_RUN_NUMBER
  };
}
