/* eslint-env node */
const metrics = ['LCP', 'FID', 'CLS', 'INP', 'TTFB', 'FCP'];
const excludeTTFB = ['LCP', 'FID', 'CLS', 'INP', 'FCP'];
const excludeFCP = ['LCP', 'FID', 'CLS', 'INP', 'TTFB'];

exports.config = {
  sauceUser: process.env.SAUCE_USERNAME,
  sauceKey: process.env.SAUCE_ACCESS_KEY,
  sauceBuild: process.env.GITHUB_RUN_NUMBER,
  // See https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/
  multiCapabilities: [
    // General Capabilities
    ...generateCapabilities('internet explorer', '11.103', 'Windows 10'),
    ...generateCapabilities('MicrosoftEdge', '14.14393', 'Windows 10'),
    ...generateCapabilities('safari', '9.0', 'OS X 10.11'),
    ...generateCapabilities('safari', '10.1', 'macOS 10.12'),
    ...generateCapabilities('safari', '11.0', 'macOS 10.12'),
    ...generateCapabilities('safari', '11.1', 'macOS 10.13'),
    ...generateCapabilities('firefox', '78.0', 'Windows 7'),
    ...generateCapabilities('firefox', '58.0', 'Windows 11'),
    ...generateCapabilities('chrome', '67.0', 'Windows 10'),
    ...generateCapabilities('chrome', '54.0', 'OS X 10.11'),
    ...generateCapabilities('chrome', '65.0', 'OS X 10.11'),
    ...generateCapabilities('chrome', '107', 'Windows 7'),
    ...generateCapabilities('chrome', '125', 'macOS 11'),
    ...generateCapabilities('chrome', '103', 'OS X 10.11'),
    ...generateCapabilities('firefox', '126', 'macOS 11.00'),
    // Specific Metric Capabilities
    ...generateMetricsCapabilities('MicrosoftEdge', '80', ['macOS 10.12', 'Windows 10', 'OS X 10.10'], ['INP', 'TTFB', 'FCP']), // done1
    ...generateMetricsCapabilities('chrome', '78', ['macOS 10.12', 'Windows 7', 'OS X 10.10'], ['FID', 'INP', 'TTFB', 'FCP']), // done2
    ...generateMetricsCapabilities('firefox', '122', ['macOS 10.15', 'Windows 10'], ['FID', 'CLS', 'INP', 'TTFB', 'FCP']), // done3
    ...generateMetricsCapabilities('chrome', '77', ['macOS 10.12', 'Windows 7', 'OS X 10.10'], ['LCP', 'CLS', 'INP', 'TTFB', 'FCP']), // done4
    ...generateMetricsCapabilities('firefox', '90', ['macOS 10.12', 'Windows 7'], ['LCP', 'CLS', 'INP', 'TTFB', 'FCP']), // done5
    ...generateCapabilities('chrome', '78', 'Windows 10', { excludes: ['LCP', 'FID', 'INP', 'TTFB', 'FCP'] }),// done7
    ...generateMetricsCapabilities('MicrosoftEdge', '97', ['macOS 10.12', 'Windows 10'], ['LCP', 'FID', 'CLS', 'TTFB', 'FCP']),// done8
    ...generateMetricsCapabilities('chrome', '97', ['macOS 10.12', 'Windows 7', 'OS X 10.11'], ['LCP', 'FID', 'CLS', 'TTFB', 'FCP']),// done9
    ...generateMetricsCapabilities('MicrosoftEdge', '79', ['macOS 10.12', 'OS X 10.10'], ['LCP', 'FID', 'CLS', 'INP']),// done10
    ...generateCapabilities('MicrosoftEdge', '13', 'Windows 10', { excludes: excludeTTFB }), // done10-1
    ...generateCapabilities('MicrosoftEdge', '92', 'Windows 10', { excludes: excludeFCP }), // done10-2
    ...generateMetricsCapabilities('chrome', '44', ['macOS 10.12', 'OS X 10.10'], excludeTTFB),// done11
    ...generateCapabilities('chrome', '67', 'Windows 7', { excludes: excludeTTFB }), // done11-1
    ...generateMetricsCapabilities('firefox', '35', ['OS X 10.10', 'macOS 10.12', 'Windows 7'], excludeTTFB),// done12
    ...generateCapabilities('safari', '11', 'macOS 10.12', { excludes: excludeTTFB }),// done13
    ...generateCapabilities('firefox', '84', 'macOS 10.12', { excludes: excludeFCP }), // done15
    ...generateCapabilities('firefox', '85', 'Windows 7', { excludes: excludeFCP }), // done16
    ...generateCapabilities('safari', '15', 'macOS 12', { excludes: excludeFCP }),// done17
    ...generateCapabilities('chrome', '60', 'macOS 10.12', { excludes: excludeFCP }), // done18
    ...generateCapabilities('chrome', '74', 'Windows 7', { excludes: excludeFCP }), // done19
    ...generateCapabilities('chrome', '85', 'OS X 10.10', { excludes: excludeFCP }), // done20
  ],
  // Do not allow parallel test execution. Makes the test execution a lot
  // slower, but the setup simpler.
  maxSessions: 1,
  jasmineNodeOpts: {
    defaultTimeoutInterval: 60000
  }
};


function generateCapabilities(browserName, version, platform, options = {}) {
  const { excludes = [] } = options;
  const includes = excludes.length === 0
    ? []
    : metrics.filter(metric => !excludes.includes(metric));

  if (includes.length === 0) {
    return [newSaucelabsCapability(browserName, version, platform)];
  }

  return includes.map(metric => newSaucelabsCapability(browserName, version, platform, metric));
}


function generateMetricsCapabilities(browserName, version, platforms, excludes) {
  return platforms.flatMap(platform => generateCapabilities(browserName, version, platform, { excludes }));
}

function newSaucelabsCapability(browserName, version, platform, metricName = '') {
  const isWebVitalsTest = metricName !== '';
  return {
    browserName,
    version,
    platform,
    metricName,
    name: isWebVitalsTest ? `weasel e2e - ${metricName} web vitals` : 'weasel e2e',
    'tunnel-identifier': 'github-action-tunnel',
    build: process.env.GITHUB_RUN_NUMBER,
    specs: isWebVitalsTest ? ['test/e2e/12_webvitalsAsCustomEvent/*.spec.js'] : ['test/e2e/**/*.spec.js'],
    exclude: isWebVitalsTest ? [] : ['test/e2e/12_webvitalsAsCustomEvent/*.spec.js']
  };
}
