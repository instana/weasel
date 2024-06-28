/* eslint-env node */
const webvitalMetrics = ['LCP', 'FID', 'CLS', 'INP', 'TTFB', 'FCP'];
const excludeTTFB = ['LCP', 'FID', 'CLS', 'INP', 'FCP'];
const excludeFCP = ['LCP', 'FID', 'CLS', 'INP', 'TTFB'];

exports.config = {
  specs: ['test/e2e/**/*.spec.js'],
  // TODO: disable webvital tests for saucelab for now, since browsers in saucelab seems never return webvital metrics
  sauceUser: process.env.SAUCE_USERNAME,
  sauceKey: process.env.SAUCE_ACCESS_KEY,
  sauceBuild: process.env.GITHUB_RUN_NUMBER,
  // See https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/
  multiCapabilities: [
    // General Capabilities
    ...generateSauceLabsCapabilities('internet explorer', '11.103', ['Windows 10'], { excludes: webvitalMetrics }),
    ...generateSauceLabsCapabilities('MicrosoftEdge', '14.14393', ['Windows 10'], { excludes: webvitalMetrics }),
    ...generateSauceLabsCapabilities('safari', '9.0', ['OS X 10.11'], { excludes: webvitalMetrics }),
    ...generateSauceLabsCapabilities('safari', '10.1', ['macOS 10.12'], { excludes: webvitalMetrics }),
    ...generateSauceLabsCapabilities('safari', '11.0', ['macOS 10.12'], { excludes: webvitalMetrics }),
    ...generateSauceLabsCapabilities('safari', '11.1', ['macOS 10.13'], { excludes: webvitalMetrics }),
    ...generateSauceLabsCapabilities('firefox', '78.0', ['Windows 7'], { excludes: webvitalMetrics }),
    ...generateSauceLabsCapabilities('firefox', '58.0', ['Windows 11'], { excludes: webvitalMetrics }),
    ...generateSauceLabsCapabilities('chrome', '67.0', ['Windows 10'], { excludes: webvitalMetrics }),
    ...generateSauceLabsCapabilities('chrome', '54.0', ['OS X 10.11'], { excludes: webvitalMetrics }),
    ...generateSauceLabsCapabilities('chrome', '65.0', ['OS X 10.11'], { excludes: webvitalMetrics }),
    ...generateSauceLabsCapabilities('chrome', '107', ['Windows 7'], { excludes: webvitalMetrics }),
    ...generateSauceLabsCapabilities('chrome', '125', ['macOS 11'], { excludes: webvitalMetrics }),
    ...generateSauceLabsCapabilities('chrome', '103', ['OS X 10.11'], { excludes: webvitalMetrics }),
    ...generateSauceLabsCapabilities('firefox', '126', ['macOS 11.00'], { excludes: webvitalMetrics }),
    // Specific Metric Capabilities
    ...generateSauceLabsCapabilities('MicrosoftEdge', '80', ['macOS 10.12', 'Windows 10', 'OS X 10.10'], { excludes: ['INP', 'TTFB', 'FCP'] }), // done1
    ...generateSauceLabsCapabilities('chrome', '78', ['macOS 10.12', 'Windows 7', 'OS X 10.10'], { excludes: ['FID', 'INP', 'TTFB', 'FCP'] }), // done2
    ...generateSauceLabsCapabilities('firefox', '122', ['macOS 10.15', 'Windows 10'], { excludes: ['FID', 'CLS', 'INP', 'TTFB', 'FCP'] }), // done3
    ...generateSauceLabsCapabilities('chrome', '77', ['macOS 10.12', 'Windows 7', 'OS X 10.10'], { excludes: ['LCP', 'CLS', 'INP', 'TTFB', 'FCP'] }), // done4
    ...generateSauceLabsCapabilities('firefox', '90', ['macOS 10.12', 'Windows 7'], { excludes: ['LCP', 'CLS', 'INP', 'TTFB', 'FCP'] }), // done5
    ...generateSauceLabsCapabilities('chrome', '78', 'Windows 10', { excludes: ['LCP', 'FID', 'INP', 'TTFB', 'FCP'] }),// done7
    ...generateSauceLabsCapabilities('MicrosoftEdge', '97', ['macOS 10.12', 'Windows 10'], { excludes: ['LCP', 'FID', 'CLS', 'TTFB', 'FCP'] }),// done8
    ...generateSauceLabsCapabilities('chrome', '97', ['macOS 10.12', 'Windows 7', 'OS X 10.11'], { excludes: ['LCP', 'FID', 'CLS', 'TTFB', 'FCP'] }),// done9
    ...generateSauceLabsCapabilities('MicrosoftEdge', '79', ['macOS 10.12', 'OS X 10.10'], { excludes: ['LCP', 'FID', 'CLS', 'INP'] }),// done10
    ...generateSauceLabsCapabilities('MicrosoftEdge', '13', 'Windows 10', { excludes: excludeTTFB }), // done10-1
    ...generateSauceLabsCapabilities('MicrosoftEdge', '92', 'Windows 10', { excludes: excludeFCP }), // done10-2
    ...generateSauceLabsCapabilities('chrome', '44', ['macOS 10.12', 'OS X 10.10'], { excludes: excludeTTFB }),// done11
    ...generateSauceLabsCapabilities('chrome', '67', 'Windows 7', { excludes: excludeTTFB }), // done11-1
    ...generateSauceLabsCapabilities('firefox', '35', ['OS X 10.10', 'macOS 10.12', 'Windows 7'], { excludes: excludeTTFB }),// done12
    ...generateSauceLabsCapabilities('safari', '11', 'macOS 10.12', { excludes: excludeTTFB }),// done13
    ...generateSauceLabsCapabilities('firefox', '84', 'macOS 10.12', { excludes: excludeFCP }), // done15
    ...generateSauceLabsCapabilities('firefox', '85', 'Windows 7', { excludes: excludeFCP }), // done16
    ...generateSauceLabsCapabilities('safari', '15', 'macOS 12', { excludes: excludeFCP }),// done17
    ...generateSauceLabsCapabilities('chrome', '60', 'macOS 10.12', { excludes: excludeFCP }), // done18
    ...generateSauceLabsCapabilities('chrome', '74', 'Windows 7', { excludes: excludeFCP }), // done19
    ...generateSauceLabsCapabilities('chrome', '85', 'OS X 10.10', { excludes: excludeFCP }), // done20
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
