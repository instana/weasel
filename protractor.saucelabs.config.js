/* eslint-env node */
// comparing with 449
const webvitalMetrics = ['LCP', 'FID', 'CLS', 'INP', 'TTFB', 'FCP'];
// const TTFBTestMetrics = ['LCP', 'FID', 'CLS', 'INP', 'FCP'];
// const FCPTestMetrics = ['LCP', 'FID', 'CLS', 'INP', 'TTFB'];

const unsupported_matrices_in_firefox = ['FCP', 'CLS', 'INP'];
const platforms_support_fireFox_126 = ['macOS 10.15', 'macOS 11.00', 'macOS 12', 'macOS 13', 'Windows 10', 'Windows 11'];

exports.config = {
  specs: ['test/e2e/**/*.spec.js'],
  sauceUser: process.env.SAUCE_USERNAME,
  sauceKey: process.env.SAUCE_ACCESS_KEY,
  sauceBuild: process.env.GITHUB_RUN_NUMBER,
  // See https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/
  // some of the APIs required to capture these metrics are currently only available in Chromium- based browsers
  // (e.g. Chrome, Edge, Opera, Samsung Internet). - https://github.com/GoogleChrome/web-vitals -
  multiCapabilities: [
    // ...generateSauceLabsCapabilities('internet explorer', '11.103', ['Windows 10'], { excludes: webvitalMetrics }), // PASSED 449
    // ...generateSauceLabsCapabilities('MicrosoftEdge', '14.14393', ['Windows 10'], { excludes: TTFBTestMetrics }), // PASSED 450
    // ...generateSauceLabsCapabilities('safari', '9.0', ['OS X 10.11'], { excludes: webvitalMetrics }), // PASSED 449
    // ...generateSauceLabsCapabilities('safari', '10.1', ['macOS 10.12'], { excludes: webvitalMetrics }), // PASSED 449
    // ...generateSauceLabsCapabilities('safari', '11.0', ['macOS 10.12'], { excludes: TTFBTestMetrics }), // PASSED 449
    // ...generateSauceLabsCapabilities('safari', '11.1', ['macOS 10.13'], { excludes: TTFBTestMetrics }), // PASSED 449
    // ...generateSauceLabsCapabilities('firefox', '78.0', ['Windows 7'], { excludes: TTFBTestMetrics }), // PASSED 449
    // ...generateSauceLabsCapabilities('firefox', '58.0', ['Windows 11'], { excludes: TTFBTestMetrics }), // PASSED 449
    // ...generateSauceLabsCapabilities('chrome', '67.0', ['Windows 10'], { excludes: TTFBTestMetrics }), // PASSED 449
    // ...generateSauceLabsCapabilities('chrome', '54.0', ['OS X 10.11'], { excludes: TTFBTestMetrics }), // PASSED 449
    // ...generateSauceLabsCapabilities('chrome', '65.0', ['OS X 10.11'], { excludes: TTFBTestMetrics }), // PASSED 449
    // ...generateSauceLabsCapabilities('chrome', '107', ['Windows 7'], { excludes: [] }), // PASSED 449
    // ...generateSauceLabsCapabilities('chrome', '125', ['macOS 11'], { excludes: [] }), // PASSED 449
    // ...generateSauceLabsCapabilities('chrome', '103', ['OS X 10.11'], { excludes: [] }), // PASSED 449
    // ...generateSauceLabsCapabilities('MicrosoftEdge', '80', ['macOS 10.12', 'Windows 10', 'OS X 10.10'], { excludes: ['INP', 'TTFB', 'FCP'] }), // PASSED 449
    // ...generateSauceLabsCapabilities('chrome', '78', ['macOS 10.12', 'Windows 7', 'OS X 10.10'], { excludes: ['FID', 'INP', 'TTFB', 'FCP'] }), // PASSED 449
    // ...generateSauceLabsCapabilities('chrome', '77', ['macOS 10.12', 'Windows 7', 'OS X 10.10'], { excludes: ['LCP', 'CLS', 'INP', 'TTFB', 'FCP'] }), // PASSED 449
    // ...generateSauceLabsCapabilities('MicrosoftEdge', '97', ['macOS 10.12', 'Windows 10'], { excludes: ['LCP', 'FID', 'CLS', 'TTFB', 'FCP'] }), // PASSED 449
    // ...generateSauceLabsCapabilities('chrome', '97', ['macOS 10.12', 'Windows 7', 'OS X 10.11'], { excludes: ['LCP', 'FID', 'CLS', 'TTFB', 'FCP'] }), // PASSED 449


    ...generateSauceLabsCapabilities('firefox', '126', ['macOS 11.00'], webvitalMetrics), // FAILED

    // ...generateSauceLabsCapabilities('firefox', '126', platforms_support_fireFox_126, { excludes: unsupported_matrices_in_firefox }), // FAILED BUILD 460
    // ...generateSauceLabsCapabilities('firefox', '126', ['macOS 11.00'], { excludes: unsupported_matrices_in_firefox }), // FAILED BUILD 460

    // ...generateSauceLabsCapabilities('firefox', '122', ['macOS 10.15', 'Windows 10'], { excludes: ['FID', 'CLS', 'INP', 'TTFB', 'FCP'] }), // FAILED 449 - to test LCP
    // https://app.saucelabs.com/dashboard/tests?build=449&browser=Firefox+122.0&ownerId=myorganization&ownerType=organization&ownerName=My+organization&start=alltime

    // ...generateSauceLabsCapabilities('firefox', '90', ['macOS 10.12', 'Windows 7'], { excludes: ['LCP', 'CLS', 'INP', 'TTFB', 'FCP'] }), // FAILED 449
    // https://app.saucelabs.com/dashboard/tests?build=449&browser=Firefox+90.0&ownerId=myorganization&ownerType=organization&ownerName=My+organization&start=alltime



    // ...generateSauceLabsCapabilities('MicrosoftEdge', '79', ['macOS 10.12', 'OS X 10.10'], { excludes: ['LCP', 'FID', 'CLS', 'INP'] }),
    // ...generateSauceLabsCapabilities('MicrosoftEdge', '13', ['Windows 10'], { excludes: TTFBTestMetrics }),
    // ...generateSauceLabsCapabilities('MicrosoftEdge', '92', ['Windows 10'], { excludes: FCPTestMetrics }),
    // ...generateSauceLabsCapabilities('chrome', '44', ['macOS 10.12', 'OS X 10.10'], { excludes: TTFBTestMetrics }),
    // ...generateSauceLabsCapabilities('chrome', '67', ['Windows 7'], { excludes: TTFBTestMetrics }),
    // ...generateSauceLabsCapabilities('firefox', '35', ['OS X 10.10', 'macOS 10.12', 'Windows 7'], { excludes: TTFBTestMetrics }),
    // ...generateSauceLabsCapabilities('firefox', '84', ['macOS 10.12'], { excludes: FCPTestMetrics }),
    // ...generateSauceLabsCapabilities('firefox', '85', ['Windows 7'], { excludes: FCPTestMetrics }),
    // ...generateSauceLabsCapabilities('safari', '15', ['macOS 12'], { excludes: FCPTestMetrics }),
    // ...generateSauceLabsCapabilities('chrome', '60', ['macOS 10.12'], { excludes: FCPTestMetrics }),
    // ...generateSauceLabsCapabilities('chrome', '74', ['Windows 7'], { excludes: FCPTestMetrics }),
    // ...generateSauceLabsCapabilities('chrome', '85', ['OS X 10.10'], { excludes: FCPTestMetrics }),
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
  const includedMetrics = webvitalMetrics.filter(metric => !options.excludes.includes(metric));
  return platforms.flatMap(platform => {
    return newSaucelabsCapability(browserName, version, platform, includedMetrics);
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
