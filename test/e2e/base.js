/* eslint-disable no-console */

const util = require('util');

exports.registerBaseHooks = () => {
  beforeEach(() => {
    // we are not using Angular.js
    browser.ignoreSynchronization = true;
  });

  afterEach(() => {
    if (process.env.CI) {
      browser.manage().logs().get('browser').then(function(browserLog) {
        console.log('Browser logs: ' + util.inspect(browserLog));
      });
    }
  });
};
