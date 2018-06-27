const {registerTestServerHooks, getE2ETestBaseUrl, getBeacons} = require('../../server/controls');
const {registerBaseHooks, exportCapabilities} = require('../base');
const {retry, expectOneMatching} = require('../../util');

const cexpect = require('chai').expect;

describe('07_wrapEventHandlers', () => {
  registerTestServerHooks();
  registerBaseHooks();

  let capabilities;
  exportCapabilities(_capabilities => capabilities = _capabilities);

  describe('sameOriginErrors', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('07_wrapEventHandlers/sameOriginErrors'));
    });

    it('must send only one error beacon for handler errors', async () => {
      if (!supportsAddEventListener()) {
        return;
      }

      await element(by.id('clickError')).click();
      await retry(async () => {
        const beacons = await getBeacons();
        cexpect(beacons.filter(b => b.ty === 'err').length).to.equal(1);

        expectOneMatching(beacons, beacon => {
          cexpect(beacon.ty).to.equal('err');
          cexpect(beacon.e).to.match(/This is intended for testing purposes/);
          cexpect(beacon.c).to.equal('1');
        });
      });
    });
  });

  describe('crossOriginErrors', () => {
    describe('with wrapEventHandlers enabled', () => {
      beforeEach(() => {
        browser.get(getE2ETestBaseUrl('07_wrapEventHandlers/crossOriginErrors'));
      });

      it('must send meaningful error messages', async () => {
        if (!supportsAddEventListener()) {
          return;
        }

        await element(by.id('clickError')).click();
        await retry(async () => {
          const beacons = await getBeacons();
          expectOneMatching(beacons, beacon => {
            cexpect(beacon.ty).to.equal('err');
            if (/safari/i.test(capabilities.browserName)) {
              // cannot make errors more readable in some safari versions
              cexpect(beacon.e).to.match(/Script error|This is intended for testing purposes/);
            } else {
              cexpect(beacon.e).to.match(/This is intended for testing purposes/);
            }
          });
        });
      });
    });

    describe('with wrapEventHandlers disabled', () => {
      beforeEach(() => {
        browser.get(getE2ETestBaseUrl('07_wrapEventHandlers/crossOriginErrors', {
          disableWrapEventHandlers: true
        }));
      });

      it('must fall back to Script error', async () => {
        if (!supportsAddEventListener()) {
          return;
        }

        await element(by.id('clickError')).click();
        await retry(async () => {
          const beacons = await getBeacons();
          expectOneMatching(beacons, beacon => {
            cexpect(beacon.ty).to.equal('err');
            // some browsers actually expose error messages even in cross-origin situations,
            // e.g. Firefox 45 and Internet Explorer 11
            cexpect(beacon.e).to.match(/Script error|This is intended for testing purposes/);
          });
        });
      });
    });
  });

  describe('with wrapEventHandlers enabled', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('07_wrapEventHandlers/eventListenerRemoval'));
    });

    it('must not break removal of event listeners', async () => {
      if (!supportsAddEventListener()) {
        return;
      }

      await element(by.id('button')).click();
      await element(by.id('button')).click();
      await element(by.id('button')).click();
      await element(by.id('button')).click();
      const text = await element(by.id('output')).getText();
      cexpect(text).to.equal('0');
    });
  });

  function supportsAddEventListener() {
    return !/internet explorer/i.test(capabilities.browserName) || Number(capabilities.version) >= 9;
  }
});
