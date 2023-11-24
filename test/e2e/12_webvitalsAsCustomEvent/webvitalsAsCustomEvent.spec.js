const {registerTestServerHooks, getE2ETestBaseUrl, getBeacons} = require('../../server/controls');
const {registerBaseHooks, restartBrowser} = require('../base');
const {retry, expectOneMatching} = require('../../util');

const cexpect = require('chai').expect;

describe('12_webvitalsAsCustomEvent', () => {
  registerTestServerHooks();
  registerBaseHooks();

  describe('webvitalsAsCustomEvent', () => {
    beforeEach(() => {
      // webvital CLS does not work if following another test, so restart browser to cleanup all context
      restartBrowser();

      browser.get(getE2ETestBaseUrl('12_webvitalsAsCustomEvent/webvitalsAsCustomEvent'));
      // wait for webvital metrics
      browser.sleep(5000);
      element(by.id('searchInput')).sendKeys('hello');
      element(by.id('searchButton')).click();
      browser.sleep(1000);
      element(by.id('button3')).click();
      browser.sleep(1000);
      element(by.id('button2')).click();
      browser.sleep(2000);
      element(by.id('button4')).click();
      browser.sleep(2000);
    });

    it('must report web-vitals as custom events', () => {
      return retry(() => {
        return getBeacons().then(beacons => {
          console.log('BEACONS', beacons);
          const pageLoadBeacon = expectOneMatching(beacons, beacon => {
            console.log('beacon', beacon);
            cexpect(beacon.ty).to.equal('pl');
          });

          console.log('))))))pageLoadBeacon', pageLoadBeacon);

          expectOneMatching(beacons, beacon => {
            cexpect(beacon.n).to.equal('instana-webvitals-LCP');
            cexpect(beacon.ty).to.equal('cus');
            cexpect(beacon.s).to.be.a('string');
            cexpect(beacon.t).to.equal(beacon.s);
            cexpect(beacon.ts).to.be.a('string');
            cexpect(parseInt(beacon.sv)).to.be.above(1);
            cexpect(beacon.r).to.equal(pageLoadBeacon.r);
            cexpect(beacon.l).to.be.a('string');
            cexpect(beacon.l).to.equal(pageLoadBeacon.u);
            cexpect(beacon.pl).to.be.a('string');
            cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
            cexpect(beacon.ul.split(',').length).to.equal(3);
            cexpect(parseFloat(beacon.d)).to.be.above(3000);
          });

          expectOneMatching(beacons, beacon => {
            cexpect(beacon.n).to.equal('instana-webvitals-FID');
            cexpect(beacon.ty).to.equal('cus');
            cexpect(beacon.s).to.be.a('string');
            cexpect(beacon.t).to.equal(beacon.s);
            cexpect(beacon.ts).to.be.a('string');
            cexpect(parseInt(beacon.sv)).to.be.above(1);
            cexpect(beacon.r).to.equal(pageLoadBeacon.r);
            cexpect(beacon.l).to.be.a('string');
            cexpect(beacon.l).to.equal(pageLoadBeacon.u);
            cexpect(beacon.pl).to.be.a('string');
            cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
            cexpect(beacon.ul.split(',').length).to.equal(3);
            cexpect(parseFloat(beacon.d)).to.equal(1);
          });

          // expectOneMatching(beacons, beacon => {
          //   cexpect(beacon.n).to.equal('instana-webvitals-CLS');
          //   cexpect(beacon.ty).to.equal('cus');
          //   cexpect(beacon.s).to.be.a('string');
          //   cexpect(beacon.t).to.equal(beacon.s);
          //   cexpect(beacon.ts).to.be.a('string');
          //   cexpect(parseInt(beacon.sv)).to.be.above(1);
          //   cexpect(beacon.r).to.equal(pageLoadBeacon.r);
          //   cexpect(beacon.l).to.be.a('string');
          //   cexpect(beacon.l).to.equal(pageLoadBeacon.u);
          //   cexpect(beacon.pl).to.be.a('string');
          //   cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
          //   cexpect(beacon.ul.split(',').length).to.equal(3);
          //   cexpect(parseFloat(beacon.d)).to.be.above(3000);
          // });
        });
      });
    });
  });
});
