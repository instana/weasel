const {registerTestServerHooks, getE2ETestBaseUrl, getBeacons} = require('../../server/controls');
const {retry, expectOneMatching} = require('../../util');
const {registerBaseHooks} = require('../base');

const cexpect = require('chai').expect;

describe('03_transmission', () => {
  registerTestServerHooks();
  registerBaseHooks();

  describe('with enabled batching', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('03_transmission/transmission', {
        withRequestBatching: true
      }));
    });

    tests();
  });

  describe('with disabled batching', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('03_transmission/transmission', {
        withRequestBatching: false
      }));
    });

    tests();
  });

  function tests() {
    it('must report beacons', async () => {
      await retry(async () => {
        const beacons = await getBeacons();
        cexpect(beacons).to.have.lengthOf(2);

        const pageLoadBeacon = expectOneMatching(beacons, beacon => {
          cexpect(beacon.s).to.equal(undefined);
          cexpect(beacon.ty).to.equal('pl');
        });

        expectOneMatching(beacons, beacon => {
          cexpect(beacon.s).to.match(/^[0-9A-F]{1,16}$/i);
          cexpect(beacon.t).to.equal(beacon.s);
          cexpect(beacon.ty).to.equal('xhr');
          cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
        });
      });
    });
  }
});
