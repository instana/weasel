/* eslint-env node */
const webVitalMetrics = ['LCP', 'FID', 'CLS', 'INP', 'TTFB', 'FCP'];
const excludeTTFB = ['LCP', 'FID', 'CLS', 'INP', 'FCP'];

exports.config = {
  // specs: ['test/e2e/**/*.spec.js'],
  // TODO: disable webvital tests for saucelab for now, since browsers in saucelab seems never return webvital metrics
  specs: ['test/e2e/12_webvitalsAsCustomEvent/*.spec.js'],
  sauceUser: process.env.SAUCE_USERNAME,
  sauceKey: process.env.SAUCE_ACCESS_KEY,
  sauceBuild: process.env.GITHUB_RUN_NUMBER,
  // See https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/
  multiCapabilities: [
    newSaucelabsCapability('internet explorer', '11.103', 'Windows 10', { excludes: webVitalMetrics }),
    newSaucelabsCapability('MicrosoftEdge', '14.14393', 'Windows 10', { excludes: excludeTTFB }),
    // newSaucelabsCapability('safari', '9.0', 'OS X 10.11', { excludes: webVitalMetrics }),
    // newSaucelabsCapability('safari', '10.1', 'macOS 10.12', { excludes: webVitalMetrics }),
    // newSaucelabsCapability('safari', '11.0', 'macOS 10.12', { excludes: webVitalMetrics }),
    // newSaucelabsCapability('safari', '11.1', 'macOS 10.13', { excludes: webVitalMetrics }),
    // newSaucelabsCapability('firefox', '78.0', 'Windows 7', { excludes: webVitalMetrics }),
    // newSaucelabsCapability('firefox', '58.0', 'Windows 11', { excludes: webVitalMetrics }),
    // newSaucelabsCapability('chrome', '67.0', 'Windows 10', { excludes: webVitalMetrics }),
    // newSaucelabsCapability('chrome', '54.0', 'OS X 10.11', { excludes: webVitalMetrics }),
    // newSaucelabsCapability('chrome', '65.0', 'OS X 10.11', { excludes: webVitalMetrics }),
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
