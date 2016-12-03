const {registerTestHooks, getE2ETestBaseUrl, getBeacons} = require('../server/controls');
const util = require('../util');

const cexpect = require('chai').expect;

describe('pageLoad', () => {
  registerTestHooks();

  it('must send pageLoad beacon', () => {
    browser.ignoreSynchronization = true;
    browser.get(`${getE2ETestBaseUrl()}/pageLoad.html`);

    return util.retry(() => {
      return getBeacons()
        .then(beacons => {
          cexpect(beacons).to.have.lengthOf(1);
        });
    });
  });
});
