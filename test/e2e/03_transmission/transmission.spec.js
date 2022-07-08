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
          cexpect(beacon.k).to.equal('key_0');
        });

        expectOneMatching(beacons, beacon => {
          cexpect(beacon.ty).to.equal('cus');
          cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
          cexpect(beacon.d).to.equal('42');
          cexpect(beacon.n).to.equal('firstEvent');
          cexpect(beacon.m_customEvent).to.equal('1');
          cexpect(beacon.k).to.equal('key_0');
        });

        expectOneMatching(beacons, beacon => {
          cexpect(beacon.ty).to.equal('cus');
          cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
          cexpect(beacon.d).to.equal('43');
          cexpect(beacon.n).to.equal('secondEvent');
          cexpect(beacon.m_foo).to.equal('bar');
          cexpect(beacon.k).to.equal('key_0');
        });
      });
    });
  }

  describe('multi-backens with enabled batching', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('03_transmission/transmission', {
        withRequestBatching: true,
        withMultiBackends: true
      }));
    });

    tests_multi_backends();
  });

  describe('multi-backends with disabled batching', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('03_transmission/transmission', {
        withRequestBatching: false,
        withMultiBackends: true
      }));
    });

    tests_multi_backends();
  });

  function tests_multi_backends() {
    it('must report beacons to multiple backends', async () => {
      await retry(async () => {
        const beacons = await getBeacons();
        cexpect(beacons).to.have.lengthOf(6);

        const pageLoadBeacon_1 = expectOneMatching(beacons, beacon => {
          cexpect(beacon.s).to.equal(undefined);
          cexpect(beacon.ty).to.equal('pl');
          cexpect(beacon.k).to.equal('key_1');
        });

        expectOneMatching(beacons, beacon => {
          cexpect(beacon.ty).to.equal('cus');
          cexpect(beacon.pl).to.equal(pageLoadBeacon_1.t);
          cexpect(beacon.d).to.equal('42');
          cexpect(beacon.n).to.equal('firstEvent');
          cexpect(beacon.m_customEvent).to.equal('1');
          cexpect(beacon.k).to.equal('key_1');
        });

        expectOneMatching(beacons, beacon => {
          cexpect(beacon.ty).to.equal('cus');
          cexpect(beacon.pl).to.equal(pageLoadBeacon_1.t);
          cexpect(beacon.d).to.equal('43');
          cexpect(beacon.n).to.equal('secondEvent');
          cexpect(beacon.m_foo).to.equal('bar');
          cexpect(beacon.k).to.equal('key_1');
        });

        const pageLoadBeacon_2 = expectOneMatching(beacons, beacon => {
          cexpect(beacon.s).to.equal(undefined);
          cexpect(beacon.ty).to.equal('pl');
          cexpect(beacon.k).to.equal('key_2');
        });

        expectOneMatching(beacons, beacon => {
          cexpect(beacon.ty).to.equal('cus');
          cexpect(beacon.pl).to.equal(pageLoadBeacon_2.t);
          cexpect(beacon.d).to.equal('42');
          cexpect(beacon.n).to.equal('firstEvent');
          cexpect(beacon.m_customEvent).to.equal('1');
          cexpect(beacon.k).to.equal('key_2');
        });

        expectOneMatching(beacons, beacon => {
          cexpect(beacon.ty).to.equal('cus');
          cexpect(beacon.pl).to.equal(pageLoadBeacon_2.t);
          cexpect(beacon.d).to.equal('43');
          cexpect(beacon.n).to.equal('secondEvent');
          cexpect(beacon.m_foo).to.equal('bar');
          cexpect(beacon.k).to.equal('key_2');
        });
      });
    });
  }
});
