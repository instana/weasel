const {registerTestServerHooks, getE2ETestBaseUrl, getBeacons} = require('../server/controls');
const {registerBaseHooks, getCapabilities, hasResourceTimingSupport} = require('./base');
const {retry, expectOneMatching} = require('../util');

const cexpect = require('chai').expect;

describe('03_spa', () => {
  registerTestServerHooks();
  registerBaseHooks();

  describe('03_spa', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('03_spa'));
    });

    it('must send SPA page transition beacon', () => {
      return getCapabilities().then(capabilities => {
        return retry(() => {
          return getBeacons().then(beacons => {
            const pageLoadBeacon = expectOneMatching(beacons, beacon => {
              cexpect(beacon.ty).to.equal('pl');
            });

            expectOneMatching(beacons, beacon => {
              cexpect(beacon.ty).to.equal('spa');
              cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
              cexpect(beacon.s).to.equal('c');
              cexpect(beacon.e).to.equal('user click');
              cexpect(beacon.l).to.equal('http://spa-test.example.com');
              cexpect(beacon.r).to.be.match(/^\d+$/);
              cexpect(beacon.ts).to.be.match(/^\d+$/);

              if (hasResourceTimingSupport(capabilities)) {
                const resourceTiming = JSON.parse(beacon.res);
                cexpect(resourceTiming).to.be.an('object');

                const keys = Object.keys(resourceTiming);
                cexpect(keys.length).to.equal(1);

                cexpect(keys[0]).to.contain('https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/2.1.1/bootstrap.min.js');
                cexpect(resourceTiming[keys[0]]).to.be.an('array');
              }
            });
          });
        });
      });
    });
  });
});
