const {registerTestServerHooks, getE2ETestBaseUrl, getBeacons} = require('../../server/controls');
const {registerBaseHooks, getCapabilities, hasPerformanceObserverSupport} = require('../base');
const {retry, expectOneMatching} = require('../../util');

const cexpect = require('chai').expect;

describe('11_userTiming', () => {
  registerTestServerHooks();
  registerBaseHooks();

  describe('various user timings', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('11_userTiming/userTiming'));
    });

    it('must report user timing data as custom events', async () => {
      const capabilities = await getCapabilities();
      if (!hasPerformanceObserverSupport(capabilities)) {
        return;
      }

      await retry(async () => {
        const beacons = await getBeacons();
        const pageLoadBeacon = expectOneMatching(beacons, beacon => {
          cexpect(beacon.ty).to.equal('pl');
        });

        expectOneMatching(beacons, beacon => {
          cexpect(beacon.ty).to.equal('cus');
          cexpect(beacon.n).to.equal('domComplete');
          cexpect(beacon.ts).to.be.a('string');
          cexpect(Number(beacon.d)).to.be.at.most(Number(pageLoadBeacon.d));
          cexpect(beacon.l).to.be.a('string');
          cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
          cexpect(beacon.m_userTimingType).to.equal('measure');
        });

        const startWorkBeacon = expectOneMatching(beacons, beacon => {
          cexpect(beacon.ty).to.equal('cus');
          cexpect(beacon.n).to.equal('startWork');
          cexpect(Number(beacon.ts)).to.be.at.least(Number(pageLoadBeacon.r));
          cexpect(beacon.d).to.equal(undefined);
          cexpect(beacon.m_userTimingType).to.equal('mark');
        });

        expectOneMatching(beacons, beacon => {
          cexpect(beacon.ty).to.equal('cus');
          cexpect(beacon.n).to.equal('endWork');
          cexpect(Number(beacon.ts)).to.be.at.least(Number(startWorkBeacon.ts));
          cexpect(beacon.d).to.equal(undefined);
          cexpect(beacon.m_userTimingType).to.equal('mark');
        });

        expectOneMatching(beacons, beacon => {
          cexpect(beacon.ty).to.equal('cus');
          cexpect(beacon.n).to.equal('work');
          cexpect(beacon.ts).to.equal(startWorkBeacon.ts);
          cexpect(beacon.d).not.to.equal('0');
          cexpect(beacon.m_userTimingType).to.equal('measure');
        });

        beacons.forEach(beacon => {
          if (beacon.ty === 'cus') {
            cexpect(beacon.n).not.to.have.string('⚛');
          }
        });
      });
    });
  });
});
