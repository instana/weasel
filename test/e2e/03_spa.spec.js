const {registerTestServerHooks, getE2ETestBaseUrl, getBeacons} = require('../server/controls');
const {retry, expectOneMatching} = require('../util');
const {registerBaseHooks} = require('./base');

const cexpect = require('chai').expect;

fdescribe('03_spa', () => {
  registerTestServerHooks();
  registerBaseHooks();

  describe('03_spa', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('03_spa'));
    });

    it('must send SPA page transition beacon', () => {
      return retry(() => {
        return getBeacons().then(beacons => {
          const pageLoadBeacon = expectOneMatching(beacons, beacon => {
            cexpect(beacon.ty).to.equal('pl');
          });

          expectOneMatching(beacons, beacon => {
            cexpect(beacon.ty).to.equal('spa');
            cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
          });
        });
      });
    });
  });
});
