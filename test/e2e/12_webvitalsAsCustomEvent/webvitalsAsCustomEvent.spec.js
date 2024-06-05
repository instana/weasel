const {registerTestServerHooks, getE2ETestBaseUrl, getBeacons} = require('../../server/controls');
const {registerBaseHooks, restartBrowser, getCapabilities} = require('../base');
const {retry, expectOneMatching} = require('../../util');

const cexpect = require('chai').expect;

describe('12_webvitalsAsCustomEvent', () => {
  registerTestServerHooks();
  registerBaseHooks();

  describe('webvitalsAsCustomEvent', () => {
    beforeEach(async () => {
      // webvital CLS does not work if following another test, so restart browser to cleanup all context
      await restartBrowser();

      await browser.get(getE2ETestBaseUrl('12_webvitalsAsCustomEvent/webvitalsAsCustomEvent'));
      // wait for webvital metrics
      await browser.sleep(5000);
      await performUserActions();

      async function performUserActions() {
        await element(by.id('searchInput')).sendKeys('hello');
        await element(by.id('searchButton')).click();
        await browser.sleep(1000);
        await element(by.id('button3')).click();
        await browser.sleep(1000);
        await element(by.id('button2')).click();
        await browser.sleep(1000);

        const currentHandle = browser.getWindowHandle();
        await element(by.id('open-blank-tab')).click();
        await browser.sleep(3000);
        await browser.switchTo().window(currentHandle);
        await browser.sleep(3000);
      }
    });
    // isLCPTestApplicable
    function isLCPTestApplicable(capabilities) {
      const version = Number(capabilities.version);
      return (
        (capabilities.browserName === 'chrome' && version > 77) ||
        (capabilities.browserName === 'MicrosoftEdge' && version > 79) ||
        (capabilities.browserName === 'Firefox' && version > 122)
      );
    }

    fit('must report web-vitals as custom events', async () => {
      const capabilities = await getCapabilities();

      if (!isLCPTestApplicable(capabilities)) {
        return true;
      }
      await retry(async () => {
        const beacons = await getBeacons();
        const pageLoadBeacon = expectOneMatching(beacons, beacon => {
          cexpect(beacon.ty).to.equal('pl');
        });

        if (isLCPTestApplicable(capabilities)) {
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

        // expectOneMatching(beacons, beacon => {
        //   cexpect(beacon.ty).to.equal('cus');
        //   cexpect(beacon.ts).to.be.a('string');
        //   cexpect(beacon.n).to.equal('instana-webvitals-FID');
        //   cexpect(beacon.l).to.be.a('string');
        //   cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
        //   cexpect(beacon.m_id).to.match(/^v\d+(-\d+)+$/);
        // });

        // expectOneMatching(beacons, beacon => {
        //   cexpect(beacon.ty).to.equal('cus');
        //   cexpect(beacon.ts).to.be.a('string');
        //   cexpect(beacon.n).to.equal('instana-webvitals-CLS');
        //   cexpect(beacon.l).to.be.a('string');
        //   cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
        //   cexpect(beacon.m_id).to.match(/^v\d+(-\d+)+$/);
        // });

        // expectOneMatching(beacons, beacon => {
        //   cexpect(beacon.ty).to.equal('cus');
        //   cexpect(beacon.ts).to.be.a('string');
        //   cexpect(beacon.n).to.equal('instana-webvitals-INP');
        //   cexpect(beacon.l).to.be.a('string');
        //   cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
        //   cexpect(beacon.m_id).to.match(/^v\d+(-\d+)+$/);
        // });
      });
    });
  });
});
