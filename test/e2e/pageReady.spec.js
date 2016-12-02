const {registerTestHooks, getE2ETestBaseUrl, getBeacons} = require('../server/controls');
const util = require('../util');

const cexpect = require('chai').expect;

describe('pageReady', () => {
  registerTestHooks();

  it('must send pageReady beacon', () => {
    browser.ignoreSynchronization = true;
    browser.get(`${getE2ETestBaseUrl()}/pageReady.html`);

    return util.retry(() => {
      return getBeacons()
        .then(beacons => {
          cexpect(beacons).to.have.lengthOf(1);
        });
    });
  });
});
