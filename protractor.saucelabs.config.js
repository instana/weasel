/* eslint-env node */

exports.config = {
  specs: ['test/e2e/**/*.spec.js'],
  // TODO: disable webvital tests for saucelab for now, since browsers in saucelab seems never return webvital metrics
  exclude: ['test/e2e/12_webvitalsAsCustomEvent/*.spec.js'],
  sauceUser: process.env.SAUCE_USERNAME,
  sauceKey: process.env.SAUCE_ACCESS_KEY,
  sauceBuild: process.env.GITHUB_RUN_NUMBER,
  // See https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/
  multiCapabilities: [
    newSaucelabsCapability('chrome', 'latest', 'Windows 11', 'TEST FOR latest chrome - Windows 11'),
    newSaucelabsCapability('edge', 'latest', 'Windows 11', 'TEST FOR latest edge - Windows 11'),
    newSaucelabsCapability('firefox', 'latest', 'Windows 11', 'TEST FOR latest firefox - Windows 11'),

    newSaucelabsCapability('chrome', 'latest', 'Windows 10', 'TEST FOR latest chrome - Windows 10'),
    newSaucelabsCapability('edge', 'latest', 'Windows 10', 'TEST FOR latest edge - Windows 10'),
    newSaucelabsCapability('firefox', 'latest', 'Windows 10', 'TEST FOR latest firefox - Windows 10'),
    newSaucelabsCapability('internetExplorer', 'latest', 'Windows 10', 'TEST FOR latest internetExplorer - Windows 10'),

    newSaucelabsCapability('chrome', 'latest', 'Windows 8.1', 'TEST FOR latest chrome - Windows 8.1'),
    newSaucelabsCapability('internetExplorer', 'latest', 'Windows 8.1', 'TEST FOR latest internetExplorer - Windows 8.1'),
    newSaucelabsCapability('firefox', 'latest', 'Windows 8.1', 'TEST FOR latest firefox - Windows 8.1'),

    newSaucelabsCapability('chrome', 'latest', 'Windows 8', 'TEST FOR latest chrome - Windows 8'),
    newSaucelabsCapability('internetExplorer', 'latest', 'Windows 8', 'TEST FOR latest internetExplorer - Windows 8'),
    newSaucelabsCapability('firefox', 'latest', 'Windows 8', 'TEST FOR latest firefox - Windows 8'),

    newSaucelabsCapability('chrome', 'latest', 'Windows 7', 'TEST FOR latest chrome - Windows 7'),
    newSaucelabsCapability('internetExplorer', 'latest', 'Windows 7', 'TEST FOR latest internetExplorer - Windows 7'),
    newSaucelabsCapability('firefox', 'latest', 'Windows 7', 'TEST FOR latest firefox - Windows 7'),

    newSaucelabsCapability('undefined', 'latest', 'Linux', 'TEST FOR latest undefined - Linux'),

    newSaucelabsCapability('chrome', 'latest', 'macOS 13', 'TEST FOR latest chrome - macOS 13'),
    newSaucelabsCapability('edge', 'latest', 'macOS 13', 'TEST FOR latest edge - macOS 13'),
    newSaucelabsCapability('firefox', 'latest', 'macOS 13', 'TEST FOR latest firefox - macOS 13'),
    newSaucelabsCapability('safari', 'latest', 'macOS 13', 'TEST FOR latest safari - macOS 13'),

    newSaucelabsCapability('chrome', 'latest', 'macOS 12', 'TEST FOR latest chrome - macOS 12'),
    newSaucelabsCapability('edge', 'latest', 'macOS 12', 'TEST FOR latest edge - macOS 12'),
    newSaucelabsCapability('firefox', 'latest', 'macOS 12', 'TEST FOR latest firefox - macOS 12'),
    newSaucelabsCapability('safari', 'latest', 'macOS 12', 'TEST FOR latest safari - macOS 12'),

    newSaucelabsCapability('chrome', 'latest', 'macOS 11.00', 'TEST FOR latest chrome - macOS 11.00'),
    newSaucelabsCapability('edge', 'latest', 'macOS 11.00', 'TEST FOR latest edge - macOS 11.00'),
    newSaucelabsCapability('firefox', 'latest', 'macOS 11.00', 'TEST FOR latest firefox - macOS 11.00'),
    newSaucelabsCapability('safari', 'latest', 'macOS 11.00', 'TEST FOR latest safari - macOS 11.00'),

    newSaucelabsCapability('chrome', 'latest', 'macOS 10.15', 'TEST FOR latest chrome - macOS 10.15'),
    newSaucelabsCapability('edge', 'latest', 'macOS 10.15', 'TEST FOR latest edge - macOS 10.15'),
    newSaucelabsCapability('firefox', 'latest', 'macOS 10.15', 'TEST FOR latest firefox - macOS 10.15'),
    newSaucelabsCapability('safari', 'latest', 'macOS 10.15', 'TEST FOR latest safari - macOS 10.15'),

    newSaucelabsCapability('chrome', 'latest', 'macOS 10.14', 'TEST FOR latest chrome - macOS 10.14'),
    newSaucelabsCapability('edge', 'latest', 'macOS 10.14', 'TEST FOR latest edge - macOS 10.14'),
    newSaucelabsCapability('firefox', 'latest', 'macOS 10.14', 'TEST FOR latest firefox - macOS 10.14'),
    newSaucelabsCapability('safari', 'latest', 'macOS 10.14', 'TEST FOR latest safari - macOS 10.14'),

    newSaucelabsCapability('chrome', 'latest', 'macOS 10.13', 'TEST FOR latest chrome - macOS 10.13'),
    newSaucelabsCapability('edge', 'latest', 'macOS 10.13', 'TEST FOR latest edge - macOS 10.13'),
    newSaucelabsCapability('firefox', 'latest', 'macOS 10.13', 'TEST FOR latest firefox - macOS 10.13'),
    newSaucelabsCapability('safari', 'latest', 'macOS 10.13', 'TEST FOR latest safari - macOS 10.13'),

    newSaucelabsCapability('chrome', 'latest', 'macOS 10.12', 'TEST FOR latest chrome - macOS 10.12'),
    newSaucelabsCapability('edge', 'latest', 'macOS 10.12', 'TEST FOR latest edge - macOS 10.12'),
    newSaucelabsCapability('firefox', 'latest', 'macOS 10.12', 'TEST FOR latest firefox - macOS 10.12'),
    newSaucelabsCapability('safari', 'latest', 'macOS 10.12', 'TEST FOR latest safari - macOS 10.12'),

    newSaucelabsCapability('chrome', 'latest', 'OS X 10.11', 'TEST FOR latest chrome - OS X 10.11'),
    newSaucelabsCapability('edge', 'latest', 'OS X 10.11', 'TEST FOR latest edge - OS X 10.11'),
    newSaucelabsCapability('firefox', 'latest', 'OS X 10.11', 'TEST FOR latest firefox - OS X 10.11'),
    newSaucelabsCapability('safari', 'latest', 'OS X 10.11', 'TEST FOR latest safari - OS X 10.11'),

    newSaucelabsCapability('chrome', 'latest', 'OS X 10.10', 'TEST FOR latest chrome - OS X 10.10'),
    newSaucelabsCapability('edge', 'latest', 'OS X 10.10', 'TEST FOR latest edge - OS X 10.10'),
    newSaucelabsCapability('firefox', 'latest', 'OS X 10.10', 'TEST FOR latest firefox - OS X 10.10'),
    newSaucelabsCapability('safari', 'latest', 'OS X 10.10', 'TEST FOR latest safari - OS X 10.10')
  ],
  // Do not allow parallel test execution. Makes the test execution a lot
  // slower, but the setup simpler.
  maxSessions: 1,
  jasmineNodeOpts: {
    defaultTimeoutInterval: 60000
  }
};

function newSaucelabsCapability(browserName, version, platform, name) {
  return {
    browserName,
    version,
    platform,
    name,
    'tunnel-identifier': 'github-action-tunnel',
    build: process.env.GITHUB_RUN_NUMBER
  };
}
