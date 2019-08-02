exports.registerBaseHooks = () => {
  beforeEach(() => {
    // we are not using Angular.js
    browser.ignoreSynchronization = true;
  });

  afterEach(async () => {
    // Wait until the page is disposed to ensure that we don't have any
    // more beacons that are in flight before the next test starts.
    await browser.get('about:blank');
  });
};

exports.getCapabilities = () => browser.getProcessedConfig().then(config => config.capabilities);

exports.exportCapabilities = exporter => {
  beforeEach(() => browser.getProcessedConfig().then(config => exporter(config.capabilities)));
};

exports.whenConfigMatches = (predicate, fn) => {
  return browser.getProcessedConfig()
    .then(config => {
      if (predicate(config)) {
        return fn(config);
      }

      return true;
    });
};

exports.hasResourceTimingSupport = (capabilities) => {
  const version = Number(capabilities.version);
  return (capabilities.browserName !== 'internet explorer' && capabilities.browserName !== 'safari') ||
    (capabilities.browserName === 'internet explorer' && version >= 10);
};

exports.hasPerformanceObserverSupport = capabilities => {
  const version = Number(capabilities.version);
  return (capabilities.browserName === 'safari' && version > 11) ||
    (capabilities.browserName === 'firefox' && version > 57) ||
    // NaN happens for local execution
    (capabilities.browserName === 'chrome' && (version > 52 || isNaN(version)));
};
