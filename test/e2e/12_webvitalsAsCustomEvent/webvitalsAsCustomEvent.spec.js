const { registerTestServerHooks, getE2ETestBaseUrl, getBeacons } = require('../../server/controls');
const { registerBaseHooks, restartBrowser, getCapabilities } = require('../base');
const { retry, expectOneMatching } = require('../../util');

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
      browser.sleep(1000);

      const currentHandle = browser.getWindowHandle();
      element(by.id('open-blank-tab')).click();
      browser.sleep(3000);
      browser.switchTo().window(currentHandle);
      browser.sleep(3000);
    });

    it('must report web-vitals as custom events', async () => {
      const capabilities = await getCapabilities();
      return retry(() => {
        return getBeacons().then(beacons => {
          const pageLoadBeacon = expectOneMatching(beacons, beacon => {
            cexpect(beacon.ty).to.equal('pl');
          });

          if (capabilities.metrics.includes('LCP')) {
            expectOneMatching(beacons, beacon => {
              cexpect(beacon.ty).to.equal('cus');
              cexpect(beacon.ts).to.be.a('string');
              cexpect(parseFloat(beacon.d)).to.be.above(3000);
              cexpect(beacon.n).to.equal('instana-webvitals-LCP');
              cexpect(beacon.l).to.be.a('string');
              cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
              cexpect(beacon.m_id).to.match(/^v\d+(-\d+)+$/);
            });
          }

          if (capabilities.metrics.includes('FID')) {
            expectOneMatching(beacons, beacon => {
              cexpect(beacon.ty).to.equal('cus');
              cexpect(beacon.ts).to.be.a('string');
              cexpect(beacon.n).to.equal('instana-webvitals-FID');
              cexpect(beacon.l).to.be.a('string');
              cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
              cexpect(beacon.m_id).to.match(/^v\d+(-\d+)+$/);
            });
          }

          if (capabilities.metrics.includes('CLS')) {
            expectOneMatching(beacons, beacon => {
              cexpect(beacon.ty).to.equal('cus');
              cexpect(beacon.ts).to.be.a('string');
              cexpect(beacon.n).to.equal('instana-webvitals-CLS');
              cexpect(beacon.l).to.be.a('string');
              cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
              cexpect(beacon.m_id).to.match(/^v\d+(-\d+)+$/);
            });
          }

          if (capabilities.metrics.includes('INP')) {
            expectOneMatching(beacons, beacon => {
              cexpect(beacon.ty).to.equal('cus');
              cexpect(beacon.ts).to.be.a('string');
              cexpect(beacon.n).to.equal('instana-webvitals-INP');
              cexpect(beacon.l).to.be.a('string');
              cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
              cexpect(beacon.m_id).to.match(/^v\d+(-\d+)+$/);
            });
          }

          if (capabilities.metrics.includes('TTFB')) {
            expectOneMatching(beacons, beacon => {
              cexpect(beacon.ty).to.equal('pl');
              cexpect(beacon.ts).to.be.a('string');
              cexpect(beacon.t_ttfb).to.be.a('string');
              cexpect(beacon.l).to.be.a('string');
              cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
            });
          }

          if (capabilities.metrics.includes('FCP')) {
            expectOneMatching(beacons, beacon => {
              cexpect(beacon.ty).to.equal('pl');
              cexpect(beacon.ts).to.be.a('string');
              cexpect(beacon.t_fcp).to.be.a('string');
              cexpect(beacon.l).to.be.a('string');
              cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
            });
          }
        });
      });
    });
  });
});
