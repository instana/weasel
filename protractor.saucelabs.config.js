/* eslint-env node */
// BUILD - 428
exports.config = {
  sauceUser: process.env.SAUCE_USERNAME,
  sauceKey: process.env.SAUCE_ACCESS_KEY,
  sauceBuild: process.env.GITHUB_RUN_NUMBER,
  // See https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/
  multiCapabilities: [
    // newSaucelabsCapability('MicrosoftEdge', '97', 'macOS 10.12', 'LCP'),// pass in 80
    // newSaucelabsCapability('MicrosoftEdge', '97', 'macOS 10.12', 'FID'),// pass in 80
    newSaucelabsCapability('MicrosoftEdge', '97', 'macOS 10.12', 'CLS'),// pass in 80
    // newSaucelabsCapability('MicrosoftEdge', '97', 'macOS 10.12', 'INP'),// pass in 97
    // newSaucelabsCapability('MicrosoftEdge', '97', 'macOS 10.12', 'TTFB'),//pass in 79
    // newSaucelabsCapability('MicrosoftEdge', '97', 'macOS 10.12', 'FCP'),//pass in 79
  ],
  // Do not allow parallel test execution. Makes the test execution a lot
  // slower, but the setup simpler.
  maxSessions: 1,
  jasmineNodeOpts: {
    defaultTimeoutInterval: 60000
  }
};

function newSaucelabsCapability(browserName, version, platform, metricName = '') {
  const isWebVitalsTest = metricName !== '';
  return {
    browserName,
    version,
    platform,
    metricName,
    name: isWebVitalsTest ? `weasel e2e - ${metricName} 'MicrosoftEdge', '97', 'macOS 10.12'` : 'weasel e2e',
    'tunnel-identifier': 'github-action-tunnel',
    build: process.env.GITHUB_RUN_NUMBER,
    specs: isWebVitalsTest ? ['test/e2e/12_webvitalsAsCustomEvent/*.spec.js'] : ['test/e2e/**/*.spec.js'],
    exclude: isWebVitalsTest ? [] : ['test/e2e/12_webvitalsAsCustomEvent/*.spec.js']
  };
}
