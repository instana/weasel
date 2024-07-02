/* eslint-env node */
const webvitalMetrics = ['LCP', 'FID', 'CLS', 'INP', 'TTFB', 'FCP'];
const testTTFBmetrics = ['TTFB'];
const testFCPmetrics = ['FCP'];
const fireFox_supporting_wv_metrices = ['LCP', 'FID', 'TTFB', 'FCP'];

exports.config = {
  // specs: ['test/e2e/**/*.spec.js'],
  specs: ['test/e2e/12_webvitalsAsCustomEvent/webvitalsAsCustomEvent.spec.js'],
  sauceUser: process.env.SAUCE_USERNAME,
  sauceKey: process.env.SAUCE_ACCESS_KEY,
  sauceBuild: process.env.GITHUB_RUN_NUMBER,
  // See https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/

  // some of the APIs required to capture these metrics are currently only available in Chromium- based browsers
  // (e.g. Chrome, Edge, Opera, Samsung Internet). - https://github.com/GoogleChrome/web-vitals -
  multiCapabilities: [
    ...generateSauceLabsCapabilities('internet explorer', '11.103', ['Windows 10'], { includedMetrics: [] }),
    ...generateSauceLabsCapabilities('MicrosoftEdge', '14.14393', ['Windows 10'], { includedMetrics: testTTFBmetrics }),
    ...generateSauceLabsCapabilities('safari', '9.0', ['OS X 10.11'], { includedMetrics: [] }),
    ...generateSauceLabsCapabilities('safari', '10.1', ['macOS 10.12'], { includedMetrics: [] }),
    ...generateSauceLabsCapabilities('safari', '11.0', ['macOS 10.12'], { includedMetrics: testTTFBmetrics }),
    ...generateSauceLabsCapabilities('safari', '11.1', ['macOS 10.13'], { includedMetrics: testTTFBmetrics }),
    ...generateSauceLabsCapabilities('firefox', '78.0', ['Windows 7'], { includedMetrics: testTTFBmetrics }),
    ...generateSauceLabsCapabilities('firefox', '58.0', ['Windows 11'], { includedMetrics: testTTFBmetrics }),
    ...generateSauceLabsCapabilities('chrome', '67.0', ['Windows 10'], { includedMetrics: testTTFBmetrics }),
    ...generateSauceLabsCapabilities('chrome', '54.0', ['OS X 10.11'], { includedMetrics: testTTFBmetrics }),
    ...generateSauceLabsCapabilities('chrome', '65.0', ['OS X 10.11'], { includedMetrics: testTTFBmetrics }),
    ...generateSauceLabsCapabilities('chrome', '125', ['macOS 11'], { includedMetrics: webvitalMetrics }),
    ...generateSauceLabsCapabilities('MicrosoftEdge', '80', ['macOS 10.12', 'Windows 10', 'OS X 10.10'], { includedMetrics: ['LCP', 'FID', 'CLS', 'TTFB', 'FCP'] }),
    ...generateSauceLabsCapabilities('firefox', '122', ['macOS 10.15', 'Windows 10'], { includedMetrics: fireFox_supporting_wv_metrices }),
    ...generateSauceLabsCapabilities('firefox', '35', ['OS X 10.10'], { includedMetrics: ['TTFB'] }),
    ...generateSauceLabsCapabilities('chrome', '96', ['macOS 10.12', 'Windows 7'], { includedMetrics: webvitalMetrics }),
    ...generateSauceLabsCapabilities('firefox', '90', ['macOS 10.12', 'Windows 7'], { includedMetrics: ['FID'] }),
    ...generateSauceLabsCapabilities('MicrosoftEdge', '97', ['macOS 10.12', 'Windows 10'], { includedMetrics: ['INP'] }),
    ...generateSauceLabsCapabilities('chrome', '97', ['macOS 10.12', 'Windows 7', 'OS X 10.11'], { includedMetrics: ['INP'] }),
    ...generateSauceLabsCapabilities('MicrosoftEdge', '79', ['macOS 10.12', 'OS X 10.10'], { includedMetrics: ['TTFB', 'FCP'] }),
    ...generateSauceLabsCapabilities('firefox', '84', ['macOS 10.12'], { testFCPmetrics: testFCPmetrics }),
    ...generateSauceLabsCapabilities('firefox', '85', ['Windows 7'], { testFCPmetrics: testFCPmetrics }),
    ...generateSauceLabsCapabilities('safari', '15', ['macOS 12'], { testFCPmetrics: testFCPmetrics }),
    ...generateSauceLabsCapabilities('chrome', '85', ['OS X 10.10'], { includedMetrics: testFCPmetrics }),
  ],
  // Do not allow parallel test execution. Makes the test execution a lot
  // slower, but the setup simpler.
  maxSessions: 1,
  jasmineNodeOpts: {
    defaultTimeoutInterval: 60000
  }
};

// Filter out the metrics that are in the excludes array, and generate capabilities for each platform.
// Note that not all web vital metrics are supported across all compatibilities.
function generateSauceLabsCapabilities(browserName, version, platforms, options) {
  // const includedMetrics = webvitalMetrics.filter(metric => !options.excludes.includes(metric));
  return platforms.flatMap(platform => {
    return newSaucelabsCapability(browserName, version, platform, options.includedMetrics);
  });
}

function newSaucelabsCapability(browserName, version, platform, metrics) {
  return {
    browserName,
    version,
    platform,
    metrics,
    name: metrics.length ? `weasel e2e - ${metrics} web vitals` : 'weasel e2e',
    'tunnel-identifier': 'github-action-tunnel',
    build: process.env.GITHUB_RUN_NUMBER
  };
}
