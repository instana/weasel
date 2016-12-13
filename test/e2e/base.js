exports.registerBaseHooks = () => {
  beforeEach(() => {
    // we are not using Angular.js
    browser.ignoreSynchronization = true;
  });
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


exports.skipInternetExplorer6 = fn => {
  return exports.whenConfigMatches(
    config => !config.capabilities.browserName === 'internet explorer' || !config.capabilities.version === '6.0',
    fn
  );
};
