const {registerTestServerHooks, getE2ETestBaseUrl, getBeacons} = require('../../server/controls');
const {registerBaseHooks} = require('../base');
const {retry, expectOneMatching} = require('../../util');

const cexpect = require('chai').expect;

describe('13_repeatedInjection', () => {
  registerTestServerHooks();
  registerBaseHooks();

  describe('repeatedInjection', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('13_repeatedInjection/repeatedInjection'));
    });

    fit('must report beacons with different key', () => {
      return retry(() => {
        return getBeacons().then(beacons => {
          const pageLoadBeacon = expectOneMatching(beacons, beacon => {
            cexpect(beacon.ty).to.equal('pl');
            cexpect(beacon.k).to.equal('key2');
          });

          expectOneMatching(beacons, beacon => {
            cexpect(beacon.ty).to.equal('cus');
            cexpect(beacon.ts).to.be.a('string');
            cexpect(beacon.n).to.equal('myTestEvent1');
            cexpect(beacon.k).to.equal('key1');
            cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
          });

          expectOneMatching(beacons, beacon => {
            cexpect(beacon.ty).to.equal('cus');
            cexpect(beacon.ts).to.be.a('string');
            cexpect(beacon.n).to.equal('myTestEvent2');
            cexpect(beacon.k).to.equal('key2');
            cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
          });

          expectOneMatching(beacons, beacon => {
            cexpect(beacon.ty).to.equal('xhr');
            cexpect(beacon.u).to.match(/^http:\/\/127\.0\.0\.1:8000\/ajax\?r=11&cacheBust=\d+$/);
            cexpect(beacon.k).to.equal('key1');
            cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
          });

          expectOneMatching(beacons, beacon => {
            cexpect(beacon.ty).to.equal('xhr');
            cexpect(beacon.u).to.match(/^http:\/\/127\.0\.0\.1:8000\/ajax\?r=22&cacheBust=\d+$/);
            cexpect(beacon.k).to.equal('key2');
            cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
          });
        });
      });
    });
  });
});
