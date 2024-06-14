/* eslint-env node */

exports.config = {
  specs: ['test/e2e/12_webvitalsAsCustomEvent/webvitalsAsCustomEvent.spec.js'],
  // TODO: disable webvital tests for saucelab for now, since browsers in saucelab seems never return webvital metrics
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
    // newSaucelabsCapability('chrome', '107', 'Windows 7'),
    // newSaucelabsCapability('chrome', '125', 'macOS 11'),
    // newSaucelabsCapability('chrome', '103', 'OS X 10.11'),
    // newSaucelabsCapability('firefox', '126', 'macOS 11.00'),

// LCP - MicrosoftEdge - PASSED
    // newSaucelabsCapability('MicrosoftEdge', '80', 'macOS 10.12'),
    // newSaucelabsCapability('MicrosoftEdge', '80', 'Windows 10'),
    // newSaucelabsCapability('MicrosoftEdge', '80', 'OS X 10.10'),

// Testing
  // LCP - Chrome
    // newSaucelabsCapability('chrome', '78', 'macOS 10.15'), // passed - 315
    // newSaucelabsCapability('chrome', '78', 'Windows 7'), // passed - 316
    newSaucelabsCapability('chrome', '78', 'OS X 10.10'),

  // LCP - firefox - osx with firefox 122 not supporting from sauceLab config
    newSaucelabsCapability('firefox', '122', 'macOS 10.15'),
    // newSaucelabsCapability('firefox', '122', 'Windows 10'),


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
    name: 'LCP - firefox - 122, macOS 10.15',
    'tunnel-identifier': 'github-action-tunnel',
    build: process.env.GITHUB_RUN_NUMBER
  };
}
