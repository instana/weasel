exports.registerBaseHooks = () => {
  beforeEach(() => {
    // we are not using Angular.js
    browser.ignoreSynchronization = true;
  });
};
