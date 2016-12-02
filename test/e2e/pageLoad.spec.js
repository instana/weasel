const {registerTestHooks, getE2ETestBaseUrl, getBeacons} = require('../server/controls');
const util = require('../util');

const cexpect = require('chai').expect;

describe('pageLoad', () => {
  registerTestHooks();

  it('must support loading of e2e pages', () => {
    browser.ignoreSynchronization = true;
    browser.get(`${getE2ETestBaseUrl()}/pageLoad.html`);
    expect(browser.getTitle()).toEqual('pageload test');

    return util.retry(() => {
      return getBeacons()
        .then(beacons => {
          cexpect(beacons).to.have.lengthOf(1);
        });
    });
  });
});
