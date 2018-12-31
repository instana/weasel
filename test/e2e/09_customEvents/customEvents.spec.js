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
          });
        });
      });
    });
  });
});
