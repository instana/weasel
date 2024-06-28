/* eslint-env node */
const webvitalMetrics = ['LCP', 'FID', 'CLS', 'INP', 'TTFB', 'FCP'];

exports.config = {
  sauceUser: process.env.SAUCE_USERNAME,
  sauceKey: process.env.SAUCE_ACCESS_KEY,
  sauceBuild: process.env.GITHUB_RUN_NUMBER,
  // See https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/
  multiCapabilities: [
    // General Capabilities
    ...generateMetricsCapabilities('internet explorer', '11.103', ['Windows 10'], { excludes: webvitalMetrics }),
    ...generateMetricsCapabilities('chrome', '78', ['macOS 10.12', 'Windows 7', 'OS X 10.10'], { excludes: ['FID', 'INP', 'TTFB', 'FCP'] }), // done2
    ...generateMetricsCapabilities('firefox', '122', ['macOS 10.15', 'Windows 10'], { excludes: ['FID', 'CLS', 'INP', 'TTFB', 'FCP'] }), // done3

  ],
  // Do not allow parallel test execution. Makes the test execution a lot
  // slower, but the setup simpler.
  maxSessions: 1,
  jasmineNodeOpts: {
    defaultTimeoutInterval: 60000
  }
};

function generateMetricsCapabilities(browserName, version, platforms, options) {
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
    build: process.env.GITHUB_RUN_NUMBER,
    specs: ['test/e2e/**/*.spec.js']
  };
}
