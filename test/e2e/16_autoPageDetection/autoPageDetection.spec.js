const {registerTestServerHooks, getE2ETestBaseUrl, getBeacons} = require('../../server/controls');
const {registerBaseHooks} = require('../base');
const {retry, expectOneMatching} = require('../../util');

const cexpect = require('chai').expect;

describe('16_autoPageDetection', () => {
  registerTestServerHooks();
  registerBaseHooks();

  describe('autoPageDetection for each page change: home, about, contact', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('16_autoPageDetection/autoPageDetection'));
    });

    it('must navigate to each nav-link and send page change beacons', () => {
      return retry(async () => {
        const beacons = await getBeacons();

        const pageLoadBeacon = expectOneMatching(beacons, beacon => {
          cexpect(beacon.ty).to.equal('pl');
        });

        expectOneMatching(beacons, beacon => {
          cexpect(beacon.ty).to.equal('pc');
          cexpect(beacon.ts).to.be.a('string');
          cexpect(beacon.sv).not.to.be.NaN;
          cexpect(beacon.r).not.to.be.NaN;
          cexpect(beacon.p).to.contain('#home');
          cexpect(beacon.l).to.contain('#home');
          cexpect(beacon.ul).to.be.a('string');
          cexpect(beacon.uf).to.be.a('string');
          cexpect(beacon['im_view.title']).to.equal('AutoPageDetectionTest');
        });

        expectOneMatching(beacons, beacon => {
          cexpect(beacon.ty).to.equal('pc');
          cexpect(beacon.ts).to.be.a('string');
          cexpect(beacon.sv).not.to.be.NaN;
          cexpect(beacon.r).not.to.be.NaN;
          cexpect(beacon.p).to.contain('#about');
          cexpect(beacon.l).to.contain('#about');
          cexpect(beacon.ul).to.be.a('string');
          cexpect(beacon.uf).to.be.a('string');
          cexpect(beacon['im_view.title']).to.equal('AutoPageDetectionTest');
        });

        expectOneMatching(beacons, beacon => {
          cexpect(beacon.ty).to.equal('pc');
          cexpect(beacon.ts).to.be.a('string');
          cexpect(beacon.sv).not.to.be.NaN;
          cexpect(beacon.r).not.to.be.NaN;
          cexpect(beacon.p).to.contain('#contact');
          cexpect(beacon.l).to.contain('#contact');
          cexpect(beacon.ul).to.be.a('string');
          cexpect(beacon.uf).to.be.a('string');
          cexpect(beacon['im_view.title']).to.equal('AutoPageDetectionTest');
        });
      });
    });
  });
});