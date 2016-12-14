exports.registerBaseHooks = () => {
  beforeEach(() => {
    // we are not using Angular.js
    browser.ignoreSynchronization = true;
  });
};

exports.getCapabilities = () => browser.getProcessedConfig().then(config => config.capabilities);

exports.whenConfigMatches = (predicate, fn) => {
  return browser.getProcessedConfig()
    .then(config => {
      if (predicate(config)) {
        return fn(config);
      }

      return true;
    });
};
