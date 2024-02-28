const {registerTestServerHooks, getE2ETestBaseUrl, getBeacons} = require('../../server/controls');
const {registerBaseHooks} = require('../base');
const {retry, expectOneMatching} = require('../../util');

const cexpect = require('chai').expect;

describe('09_customEvents', () => {
  registerTestServerHooks();
  registerBaseHooks();

  describe('simpleEventReporting', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('09_customEvents/simpleEventReporting'));
    });

    it('must report custom events', () => {
      return retry(() => {
        return getBeacons().then(beacons => {
          const pageLoadBeacon = expectOneMatching(beacons, beacon => {
            cexpect(beacon.ty).to.equal('pl');
          });

          expectOneMatching(beacons, beacon => {
            cexpect(beacon.ty).to.equal('cus');
            cexpect(beacon.ts).to.be.a('string');
            cexpect(beacon.d).to.equal('42');
            cexpect(beacon.n).to.equal('myTestEvent');
            cexpect(beacon.l).to.be.a('string');
            cexpect(beacon.e).to.match(/Testing 123/);
            cexpect(beacon.st).to.be.a('string');
            cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
            cexpect(beacon.cs).to.equal('a component stack');
            cexpect(beacon.m_name).to.equal('Tom');
            cexpect(beacon.m_age).to.equal('23');
            cexpect(beacon.m_kind).to.equal('experienced');
            cexpect(beacon.m_state).to.equal('broken');
            cexpect(beacon.bt).to.equal('ab87128a1ff99345');
            cexpect(beacon.cm).to.equal('123.2342');
          });
        });
      });
    });
  });

  describe('simpleEventReportingWithoutBackendTraceId', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('09_customEvents/simpleEventReportingWithoutBackendTraceId'));
    });

    it('must report custom events', () => {
      return retry(() => {
        return getBeacons().then(beacons => {
          const pageLoadBeacon = expectOneMatching(beacons, beacon => {
            cexpect(beacon.ty).to.equal('pl');
          });

          expectOneMatching(beacons, beacon => {
            cexpect(beacon.ty).to.equal('cus');
            cexpect(beacon.ts).to.be.a('string');
            cexpect(beacon.n).to.equal('testWithEmptyBackendTraceId');
            cexpect(beacon.e).to.match(/Testing 123/);
            cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
            cexpect(beacon.bt).to.be.undefined;
          });

          expectOneMatching(beacons, beacon => {
            cexpect(beacon.ty).to.equal('cus');
            cexpect(beacon.ts).to.be.a('string');
            cexpect(beacon.n).to.equal('testWithNoBackendTraceId');
            cexpect(beacon.e).to.match(/something wrong/);
            cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
            cexpect(beacon.bt).to.be.undefined;
          });

          expectOneMatching(beacons, beacon => {
            cexpect(beacon.ty).to.equal('cus');
            cexpect(beacon.ts).to.be.a('string');
            cexpect(beacon.n).to.equal('testWithInvalidBackendTraceId');
            cexpect(beacon.e).to.match(/something wrong/);
            cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
            cexpect(beacon.bt).to.be.undefined;
          });
        });
      });
    });
  });

  describe('simpleEventReportingWithoutCustomMetric', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('09_customEvents/simpleEventReportingWithoutCustomMetric'));
    });

    it('must report custom events', () => {
      return retry(() => {
        return getBeacons().then(beacons => {
          const pageLoadBeacon = expectOneMatching(beacons, beacon => {
            cexpect(beacon.ty).to.equal('pl');
          });

          expectOneMatching(beacons, beacon => {
            cexpect(beacon.ty).to.equal('cus');
            cexpect(beacon.ts).to.be.a('string');
            cexpect(beacon.n).to.equal('testWithEmptyCustomMetric');
            cexpect(beacon.e).to.match(/Testing 123/);
            cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
            cexpect(beacon.bt).to.equal('ab87128a1ff99345');
            cexpect(beacon.cm).to.be.undefined;
          });

          expectOneMatching(beacons, beacon => {
            cexpect(beacon.ty).to.equal('cus');
            cexpect(beacon.ts).to.be.a('string');
            cexpect(beacon.n).to.equal('testWithNoCustomMetric');
            cexpect(beacon.e).to.match(/something wrong/);
            cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
            cexpect(beacon.bt).to.equal('ab87128a1ff99345');
            cexpect(beacon.cm).to.be.undefined;
          });

          expectOneMatching(beacons, beacon => {
            cexpect(beacon.ty).to.equal('cus');
            cexpect(beacon.ts).to.be.a('string');
            cexpect(beacon.n).to.equal('testWithIncorrectCustomMetric');
            cexpect(beacon.e).to.match(/something wrong/);
            cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
            cexpect(beacon.bt).to.equal('ab87128a1ff99345');
            cexpect(beacon.cm).to.be.undefined;
          });

          expectOneMatching(beacons, beacon => {
            cexpect(beacon.ty).to.equal('cus');
            cexpect(beacon.ts).to.be.a('string');
            cexpect(beacon.n).to.equal('testWithExponentialCustomMetric(1e5)');
            cexpect(beacon.e).to.match(/something wrong/);
            cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
            cexpect(beacon.bt).to.equal('ab87128a1ff99345');
            cexpect(beacon.cm).to.equal('100000');
          });
        });
      });
    });
  });
});
