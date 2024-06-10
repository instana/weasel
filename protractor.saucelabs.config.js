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
    // newSaucelabsCapability('internet explorer', '11.103', 'Windows 10'),
    // newSaucelabsCapability('MicrosoftEdge', '14.14393', 'Windows 10'),
    // newSaucelabsCapability('safari', '9.0', 'OS X 10.11'),
    // newSaucelabsCapability('safari', '10.1', 'macOS 10.12'),
    // newSaucelabsCapability('safari', '11.0', 'macOS 10.12'),
    // newSaucelabsCapability('safari', '11.1', 'macOS 10.13'),
    // newSaucelabsCapability('firefox', '78.0', 'Windows 7'),
    // newSaucelabsCapability('firefox', '58.0', 'Windows 11'),
    // newSaucelabsCapability('chrome', '67.0', 'Windows 10'),
    // newSaucelabsCapability('chrome', '54.0', 'OS X 10.11'),
    // newSaucelabsCapability('chrome', '65.0', 'OS X 10.11'),

    newSaucelabsCapability('chrome', '122', 'Windows 11'),
    newSaucelabsCapability('chrome', '125', 'Windows 11'),
    newSaucelabsCapability('chrome', '125', 'Windows 10'),
    newSaucelabsCapability('chrome', '109', 'Windows 8.1'),
    newSaucelabsCapability('chrome', '109', 'Windows 8'),
    newSaucelabsCapability('chrome', '107', 'Windows 7'),
    newSaucelabsCapability('chrome', '125', 'macOS 13'),
    newSaucelabsCapability('chrome', '125', 'macOS 12'),
    newSaucelabsCapability('chrome', '125', 'macOS 11'),
    newSaucelabsCapability('chrome', '125', 'macOS 10.15'),
    newSaucelabsCapability('chrome', '116', 'macOS 10.14'),
    newSaucelabsCapability('chrome', '107', 'macOS 10.13'),
    newSaucelabsCapability('chrome', '103', 'macOS 10.12'),
    newSaucelabsCapability('chrome', '103', 'OS X 10.11'),

    newSaucelabsCapability('chrome', 'latest', 'Windows 7'),
    newSaucelabsCapability('chrome', 'latest', 'Windows 10'),
    newSaucelabsCapability('chrome', 'latest', 'Windows 11'),
    newSaucelabsCapability('chrome', 'latest', 'macOS 10.12'),
    newSaucelabsCapability('chrome', 'latest', 'macOS 10.13'),
    newSaucelabsCapability('chrome', 'latest', 'macOS 11.0'),
    newSaucelabsCapability('chrome', 'latest', 'OS X 10.11')
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
    'tunnel-identifier': 'github-action-tunnel',
    build: process.env.GITHUB_RUN_NUMBER
  };
}
