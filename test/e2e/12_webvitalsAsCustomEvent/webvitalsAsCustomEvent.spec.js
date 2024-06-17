const {registerTestServerHooks, getE2ETestBaseUrl, getBeacons} = require('../../server/controls');
const {registerBaseHooks, restartBrowser, getCapabilities} = require('../base');
const {retry, expectOneMatching} = require('../../util');

const cexpect = require('chai').expect;

// 1. UNCOMMENT FOR LCP
// const LCPsupportChromeBrowser = ['macOS 10.12','macOS 10.15', 'Windows 7', 'OS X 10.10'];
// const LCPsupportFireFoxBrowser = ['macOS 10.15', 'Windows 10'];
// const LCPsupportEdgeBrowser = ['macOS 10.12', 'Windows 10', 'OS X 10.10'];

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

    // 2. UNCOMMENT FOR LCP
    // function isLCPTestApplicable(capabilities) {
    //   const version = Number(capabilities.version);
    //   return (
    //     (capabilities.browserName === 'chrome' && version > 77 && LCPsupportChromeBrowser.includes(capabilities.platform)) ||
    //     (capabilities.browserName === 'MicrosoftEdge' && version > 79 && LCPsupportEdgeBrowser.includes(capabilities.platform)) ||
    //     (capabilities.browserName === 'firefox' && version > 124 && LCPsupportFireFoxBrowser.includes(capabilities.platform))
    //   );
    // }

    it('must report web-vitals as custom events', async() => {
      const capabilities = await getCapabilities();
      return retry(() => {
        return getBeacons().then(beacons => {
          const pageLoadBeacon = expectOneMatching(beacons, beacon => {
            cexpect(beacon.ty).to.equal('pl');
          });

          // 3. UNCOMMENT FOR LCP
          // if(isLCPTestApplicable(capabilities)) {
          // expectOneMatching(beacons, beacon => {
          //   cexpect(beacon.ty).to.equal('cus');
          //   cexpect(beacon.ts).to.be.a('string');
          //   cexpect(parseFloat(beacon.d)).to.be.above(3000);
          //   cexpect(beacon.n).to.equal('instana-webvitals-LCP');
          //   cexpect(beacon.l).to.be.a('string');
          //   cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
          //   cexpect(beacon.m_id).to.match(/^v\d+(-\d+)+$/);
          // });
          // }

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

          expectOneMatching(beacons, beacon => {
            cexpect(beacon.ty).to.equal('cus');
            cexpect(beacon.ts).to.be.a('string');
            cexpect(beacon.n).to.equal('instana-webvitals-INP');
            cexpect(beacon.l).to.be.a('string');
            cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
            cexpect(beacon.m_id).to.match(/^v\d+(-\d+)+$/);
          });
        });
      });
    });
  });
});
