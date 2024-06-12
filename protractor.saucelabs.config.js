/* eslint-env node */

exports.config = {
  sauceUser: process.env.SAUCE_USERNAME,
  sauceKey: process.env.SAUCE_ACCESS_KEY,
  sauceBuild: process.env.GITHUB_RUN_NUMBER,
  // See https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/
  multiCapabilities: [
    // Old browser+OS platforms for non-web-vitals tests
    newSaucelabsCapability('internet explorer', '11.103', 'Windows 10'),
    newSaucelabsCapability('MicrosoftEdge', '14.14393', 'Windows 10'),
    newSaucelabsCapability('safari', '9.0', 'OS X 10.11'),
    newSaucelabsCapability('safari', '10.1', 'macOS 10.12'),
    newSaucelabsCapability('safari', '11.0', 'macOS 10.12'),
    newSaucelabsCapability('safari', '11.1', 'macOS 10.13'),
    newSaucelabsCapability('firefox', '78.0', 'Windows 7'),
    newSaucelabsCapability('firefox', '58.0', 'Windows 11'),
    newSaucelabsCapability('chrome', '67.0', 'Windows 10'),
    newSaucelabsCapability('chrome', '54.0', 'OS X 10.11'),
    newSaucelabsCapability('chrome', '65.0', 'OS X 10.11'),

    // Specific supported browser+OS for web-vitals tests.
    newSaucelabsCapability('chrome', '107', 'Windows 7', true),
    newSaucelabsCapability('chrome', '125', 'macOS 11', true),
    newSaucelabsCapability('chrome', '103', 'OS X 10.11', true)
  ],
  // Do not allow parallel test execution. Makes the test execution a lot
  // slower, but the setup simpler.
  maxSessions: 1,
  jasmineNodeOpts: {
    defaultTimeoutInterval: 60000
  }
};

function newSaucelabsCapability(browserName, version, platform, isWebVitalsTest = false) {
  return {
    browserName,
    version,
    platform,
    name: isWebVitalsTest ? 'weasel e2e - web vitals' : 'weasel e2e',
    'tunnel-identifier': 'github-action-tunnel',
    build: process.env.GITHUB_RUN_NUMBER,
    specs: isWebVitalsTest ? ['test/e2e/12_webvitalsAsCustomEvent/*.spec.js'] : ['test/e2e/**/*.spec.js'],
    exclude: isWebVitalsTest ? [] : ['test/e2e/12_webvitalsAsCustomEvent/*.spec.js']
  };
}
