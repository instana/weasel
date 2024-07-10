/* eslint-env node */

const webvitalMetrics = {
  all: ['LCP', 'FID', 'CLS', 'INP', 'TTFB', 'FCP'],
  noINP: ['LCP', 'FID', 'CLS', 'TTFB', 'FCP'],
  noFCP: ['LCP', 'FID', 'CLS', 'INP', 'TTFB'],
  noINP_FCP: ['LCP', 'FID', 'CLS', 'TTFB'],
  onlyFCP: ['FCP'],
  onlyTTFB: ['TTFB'],
  firefox: ['LCP', 'FID', 'TTFB', 'FCP']
};

exports.config = {
  specs: ['test/e2e/**/*.spec.js'],
  sauceUser: process.env.SAUCE_USERNAME,
  sauceKey: process.env.SAUCE_ACCESS_KEY,
  sauceBuild: process.env.GITHUB_RUN_NUMBER,
  // See https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/

  // some of the APIs required to capture these metrics are currently only available in Chromium- based browsers
  // (e.g. Chrome, Edge, Opera, Samsung Internet). - https://github.com/GoogleChrome/web-vitals -
  multiCapabilities: [
    newSaucelabsCapability('internet explorer', '11.103', ['Windows 10'], { includedMetrics: [] }),
    newSaucelabsCapability('MicrosoftEdge', '14.14393', ['Windows 10'], { includedMetrics: webvitalMetrics.onlyTTFB }),
    newSaucelabsCapability('safari', '9.0', ['OS X 10.11'], { includedMetrics: [] }),
    newSaucelabsCapability('safari', '10.1', ['macOS 10.12'], { includedMetrics: [] }),
    newSaucelabsCapability('safari', '11.0', ['macOS 10.12'], { includedMetrics: webvitalMetrics.onlyTTFB }),
    newSaucelabsCapability('safari', '11.1', ['macOS 10.13'], { includedMetrics: webvitalMetrics.onlyTTFB }),
    newSaucelabsCapability('firefox', '78.0', ['Windows 7'], { includedMetrics: webvitalMetrics.onlyTTFB }),
    newSaucelabsCapability('firefox', '58.0', ['Windows 11'], { includedMetrics: webvitalMetrics.onlyTTFB }),
    newSaucelabsCapability('chrome', '67.0', ['Windows 10'], { includedMetrics: webvitalMetrics.onlyTTFB }),
    newSaucelabsCapability('chrome', '54.0', ['OS X 10.11'], { includedMetrics: webvitalMetrics.onlyTTFB }),
    newSaucelabsCapability('chrome', '65.0', ['OS X 10.11'], { includedMetrics: webvitalMetrics.onlyTTFB }),

    newSaucelabsCapability('chrome', '85', ['OS X 10.10', 'macOS 10.12', 'Windows 8'], { includedMetrics: webvitalMetrics.noINP_FCP }),
    newSaucelabsCapability('chrome', '96', ['OS X 10.11', 'macOS 12', 'Windows 11'], { includedMetrics: webvitalMetrics.noFCP }),

    newSaucelabsCapability('firefox', '90', ['macOS 10.12', 'Windows 7'], { includedMetrics: ['FID', 'TTFB', 'FCP'] }),
    newSaucelabsCapability('firefox', '122', ['macOS 10.15', 'Windows 10'], { includedMetrics: webvitalMetrics.firefox }),

    newSaucelabsCapability('MicrosoftEdge', '13', ['Windows 10'], { includedMetrics: webvitalMetrics.onlyTTFB }),
    newSaucelabsCapability('MicrosoftEdge', '80', ['OS X 10.10', 'macOS 10.12', 'Windows 10'], { includedMetrics: webvitalMetrics.noINP }),
    newSaucelabsCapability('MicrosoftEdge', '97', ['macOS 10.12', 'Windows 10'], { includedMetrics: webvitalMetrics.all }),

    newSaucelabsCapability('safari', '15', ['macOS 12'], { includedMetrics: webvitalMetrics.onlyFCP }),
  ].flat(),
  // Do not allow parallel test execution. Makes the test execution a lot
  // slower, but the setup simpler.
  maxSessions: 1,
  jasmineNodeOpts: {
    defaultTimeoutInterval: 60000
  }
};

// Filter out the metrics that are in the excludes array, and generate capabilities for each platform.
// Note that not all web vital metrics are supported across all compatibilities.
function newSaucelabsCapability(browserName, version, platforms, options) {
  return platforms.flatMap(platform => {
    return newSaucelabsCapabilityForSinglePlatform(browserName, version, platform, options.includedMetrics);
  });
}

function newSaucelabsCapabilityForSinglePlatform(browserName, version, platform, metrics) {
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
