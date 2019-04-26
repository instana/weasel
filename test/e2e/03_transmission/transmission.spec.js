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
        cexpect(beacons).to.have.lengthOf(3);

        const pageLoadBeacon = expectOneMatching(beacons, beacon => {
          cexpect(beacon.s).to.equal(undefined);
          cexpect(beacon.ty).to.equal('pl');
        });

        expectOneMatching(beacons, beacon => {
          cexpect(beacon.ty).to.equal('cus');
          cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
          cexpect(beacon.d).to.equal('42');
          cexpect(beacon.n).to.equal('firstEvent');
          cexpect(beacon.m_customEvent).to.equal('1');
        });

        expectOneMatching(beacons, beacon => {
          cexpect(beacon.ty).to.equal('cus');
          cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
          cexpect(beacon.d).to.equal('43');
          cexpect(beacon.n).to.equal('secondEvent');
          cexpect(beacon.m_foo).to.equal('bar');
        });
      });
    });
  }
});
