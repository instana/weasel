/* eslint-env node */

exports.config = {
  sauceUser: process.env.SAUCE_USERNAME,
  sauceKey: process.env.SAUCE_ACCESS_KEY,
  sauceBuild: process.env.GITHUB_RUN_NUMBER,
  // See https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/
  multiCapabilities: [
    //     newSaucelabsCapability('internet explorer', '11.103', 'Windows 10'),
    //     newSaucelabsCapability('MicrosoftEdge', '14.14393', 'Windows 10'),
    //     newSaucelabsCapability('safari', '9.0', 'OS X 10.11'),
    //     newSaucelabsCapability('safari', '10.1', 'macOS 10.12'),
    //     newSaucelabsCapability('safari', '11.0', 'macOS 10.12'),
    //     newSaucelabsCapability('safari', '11.1', 'macOS 10.13'),
    //     newSaucelabsCapability('firefox', '78.0', 'Windows 7'),
    //     newSaucelabsCapability('firefox', '58.0', 'Windows 11'),
    //     newSaucelabsCapability('chrome', '67.0', 'Windows 10'),
    //     newSaucelabsCapability('chrome', '54.0', 'OS X 10.11'),
    //     newSaucelabsCapability('chrome', '65.0', 'OS X 10.11'),
    //     newSaucelabsCapability('chrome', '107', 'Windows 7'),
    //     newSaucelabsCapability('chrome', '125', 'macOS 11'),
    //     newSaucelabsCapability('chrome', '103', 'OS X 10.11'),
    //     newSaucelabsCapability('firefox', '126', 'macOS 11.00'),

    // // LCP
    //   // LCP - MicrosoftEdge - PASSED
    //   // SauceLab not supporting MicrosoftEdge 80 with Windows 7, 8, 8.1
    //     newSaucelabsCapability('MicrosoftEdge', '80', 'macOS 10.12', 'LCP'), // passed - 314
    //     newSaucelabsCapability('MicrosoftEdge', '80', 'Windows 10', 'LCP'), // passed - 314
    //     newSaucelabsCapability('MicrosoftEdge', '80', 'OS X 10.10', 'LCP'), // passed - 314

    //   // LCP - Chrome - PASSED
    //     newSaucelabsCapability('chrome', '78', 'macOS 10.12', 'LCP'), // passed - 323
    //     newSaucelabsCapability('chrome', '78', 'Windows 7', 'LCP'), // passed - 316
    //     newSaucelabsCapability('chrome', '78', 'OS X 10.10', 'LCP'), // passed 317

    //   // LCP firefox - PASSED
    //   // SauceLab not supporting firefox 122 with OS X 10.10, OS X 10.11
    //   // SauceLab not supporting firefox 122 with macOS 10.12, 10.13, 10.14
    //   // SauceLab not supporting MicrosoftEdge 80 with Windows 7, 8, 8.1
    //     newSaucelabsCapability('firefox', '122', 'macOS 10.15', 'LCP'), // passed - 341
    //     newSaucelabsCapability('firefox', '122', 'Windows 10', 'LCP'), // passed - 320

    // // FID
    //   // FID - MicrosoftEdge - PASSED
    //   // SauceLab not supporting MicrosoftEdge 80 with Windows 7, 8, 8.1
    //     newSaucelabsCapability('MicrosoftEdge', '80', 'macOS 10.12', 'FID'), // passed - 331
    //     newSaucelabsCapability('MicrosoftEdge', '80', 'Windows 10', 'FID'), // passed - 332
    //     newSaucelabsCapability('MicrosoftEdge', '80', 'OS X 10.10', 'FID'), // passed - 330

    //   // FID - Chrome - PASSED
    //     newSaucelabsCapability('chrome', '77', 'macOS 10.12', 'FID'), // passed - 334
    //     newSaucelabsCapability('chrome', '77', 'Windows 7', 'FID'), // passed - 335
    //     newSaucelabsCapability('chrome', '77', 'OS X 10.10', 'FID'), // passed - 333

    //   // FID firefox - PASSED
    //   // SauceLab not supporting firefox 90 with OS X 10.10, 10.11
    //     newSaucelabsCapability('firefox', '90', 'macOS 10.12', 'FID'), // passed - 337
    //     newSaucelabsCapability('firefox', '90', 'Windows 7', 'FID'), // passed - 338

    // // CLS
    //   // CLS - MicrosoftEdge - PASSED
    //   // SauceLab not supporting MicrosoftEdge 80 with Windows 7, 8, 8.1
    //     newSaucelabsCapability('MicrosoftEdge', '80', 'macOS 10.12', 'CLS'), // passed - 347
    //     newSaucelabsCapability('MicrosoftEdge', '80', 'Windows 10', 'CLS'), // passed - 346
    //     newSaucelabsCapability('MicrosoftEdge', '80', 'OS X 10.10', 'CLS'), // passed - 345

    //   // CLS - Chrome - PASSED
    //   // SauceLab not supporting chrome 78 with Windows 7, 8, 8.1
    //     newSaucelabsCapability('chrome', '78', 'macOS 10.12', 'CLS'), // passed - 343
    //     newSaucelabsCapability('chrome', '78', 'Windows 10', 'CLS'), // passed - 344
    //     newSaucelabsCapability('chrome', '78', 'OS X 10.10', 'CLS'), // passed - 342

    // // INP
    //   // INP - MicrosoftEdge - PASSED
    //   // SauceLab not supporting MicrosoftEdge 97 with Windows 7, 8, 8.1.
    //   // SauceLab not supporting MicrosoftEdge 97 with OS X 10.11, 10.11.
    //     newSaucelabsCapability('MicrosoftEdge', '97', 'macOS 10.12', 'INP'), // passed - 351
    //     newSaucelabsCapability('MicrosoftEdge', '97', 'Windows 10', 'INP'), // passed - 352

    //   // INP - Chrome - PASSED
    //     newSaucelabsCapability('chrome', '97', 'macOS 10.12', 'INP'), // passed - 350
    //     newSaucelabsCapability('chrome', '97', 'Windows 7', 'INP'), // passed - 349
    //     newSaucelabsCapability('chrome', '97', 'OS X 10.11', 'INP'), // passed - 348

    // // TTFB
    //   // TTFB - MicrosoftEdge - PASSED
    //    newSaucelabsCapability('MicrosoftEdge', '79', 'macOS 10.12', 'TTFB'), // passed - 385
    //    newSaucelabsCapability('MicrosoftEdge', '13', 'Windows 10', 'TTFB'), // passed - 384
    //    newSaucelabsCapability('MicrosoftEdge', '79', 'OS X 10.10', 'TTFB'), // passed - 383

    //   // TTFB - Chrome - PASSED
    //     newSaucelabsCapability('chrome', '44', 'macOS 10.12', 'TTFB'), // passed - 362
    //     newSaucelabsCapability('chrome', '67', 'Windows 7', 'TTFB'), // passed - 382
    //     newSaucelabsCapability('chrome', '44', 'OS X 10.10', 'TTFB'), // passed - 359

    //   // TTFB firefox - PASSED
    //    newSaucelabsCapability('firefox', '35', 'OS X 10.10', 'TTFB'), // passed - 386
    //    newSaucelabsCapability('firefox', '35', 'macOS 10.12', 'TTFB'), // passed - 387
    //    newSaucelabsCapability('firefox', '35', 'Windows 7', 'TTFB'), // passed - 388

    //   // TTFB safari - PASSED
    //    newSaucelabsCapability('safari', '11', 'macOS 10.12', 'TTFB'), // passed - 390

    // // FCP
    //   // FCP - MicrosoftEdge - PASSED
    //     newSaucelabsCapability('MicrosoftEdge', '79', 'macOS 10.12', 'FCP'), // passed - 403
    //     newSaucelabsCapability('MicrosoftEdge', '92', 'Windows 10', 'FCP'), // passed - 417
    //     newSaucelabsCapability('MicrosoftEdge', '79', 'OS X 10.10', 'FCP'), // passed - 408

    //   // FCP - Chrome - TEST
    //     newSaucelabsCapability('chrome', '6OS 10.12', 'FCP'), // passed - 392
    //     newSaucelabsCapability('chrome', '74', 'Windows 7', 'FCP'), // passed - 411
    //     newSaucelabsCapability('chrome', '85', 'OS X 10.10', 'FCP'), // passed - 397


    //   // FCP firefox - TEST
    // newSaucelabsCapability('firefox', '84', 'macOS 10.12', 'FCP'), // TEST -
    newSaucelabsCapability('firefox', '84', 'Windows 7', 'FCP'), // TEST -

    //   // FCP safari - TEST
    //    newSaucelabsCapability('safari', '14.1', 'macOS 10.12', 'FCP'), // TEST -
    //    newSaucelabsCapability('safari', '14.1', 'OS X 10.10', 'FCP'), // TEST -
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
    name: isWebVitalsTest ? `${metricName} firefox 84, Windows 7` : 'weasel e2e',
    'tunnel-identifier': 'github-action-tunnel',
    build: process.env.GITHUB_RUN_NUMBER,
    specs: ['test/e2e/12_webvitalsAsCustomEvent/*.spec.js'],
    // specs: isWebVitalsTest ? ['test/e2e/12_webvitalsAsCustomEvent/*.spec.js'] : ['test/e2e/**/*.spec.js'],
    // exclude: isWebVitalsTest ? [] : ['test/e2e/12_webvitalsAsCustomEvent/*.spec.js']
  };
}
