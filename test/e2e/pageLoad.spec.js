const {registerTestHooks, getE2ETestBaseUrl} = require('../server/controls');

describe('pageLoad', () => {
  registerTestHooks();

  it('must support loading of e2e pages', () => {
    browser.ignoreSynchronization = true;
    browser.get(`${getE2ETestBaseUrl()}/pageLoad.html`);
    expect(browser.getTitle()).toEqual('pageload test');
  });
});
