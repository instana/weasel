const {registerTestServerHooks, getE2ETestBaseUrl, getBeacons} = require('../../server/controls');
const {registerBaseHooks, exportCapabilities} = require('../base');
const {retry, expectOneMatching} = require('../../util');

const cexpect = require('chai').expect;

describe('06_wrapTimers', () => {
  let capabilities;

  registerTestServerHooks();
  registerBaseHooks();

  exportCapabilities(_capabilities => capabilities = _capabilities);

  describe('sameOriginErrors', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('06_wrapTimers/sameOriginErrors'));
    });

    it('must send only one error beacon for setTimeout errors', async () => {
      await element(by.id('forceSetTimeout')).click();
      await retry(async () => {
        const beacons = await getBeacons();
        cexpect(beacons.filter(b => b.ty === 'err').length).to.equal(1, JSON.stringify(beacons, 0, 2));

        expectOneMatching(beacons, beacon => {
          cexpect(beacon.ty).to.equal('err');
          cexpect(beacon.e).to.match(new RegExp(getErrorMessage('st')));
          cexpect(beacon.c).to.equal('1');
        });
      });
    });

    it('must catch errors in setInterval', async () => {
      await element(by.id('forceSetInterval')).click();
      await retry(async () => {
        const beacons = await getBeacons();
        expectOneMatching(beacons, beacon => {
          cexpect(beacon.ty).to.equal('err');
          cexpect(beacon.e).to.match(new RegExp(getErrorMessage('si')));
        });
      });
    });
  });

  describe('crossOriginErrors', () => {
    describe('with wrapTimers enabled', () => {
      beforeEach(() => {
        browser.get(getE2ETestBaseUrl('06_wrapTimers/crossOriginErrors'));
      });

      it('must send meaningful error messages', async () => {
        await element(by.id('forceSetTimeout')).click();
        await retry(async () => {
          const beacons = await getBeacons();
          expectOneMatching(beacons, beacon => {
            cexpect(beacon.ty).to.equal('err');
            cexpect(beacon.e).to.match(new RegExp(getErrorMessage('st')));
          });
        });
      });
    });

    describe('with wrapTimers disabled', () => {
      beforeEach(() => {
        browser.get(getE2ETestBaseUrl('06_wrapTimers/crossOriginErrors', {
          disableWrapTimers: true
        }));
      });

      it('must fall back to Script error', async () => {
        await element(by.id('forceSetTimeout')).click();
        await retry(async () => {
          const beacons = await getBeacons();
          expectOneMatching(beacons, beacon => {
            cexpect(beacon.ty).to.equal('err');
            // some browsers actually expose error messages even in cross-origin situations,
            // e.g. Firefox 45 and Internet Explorer 11
            cexpect(beacon.e).to.match(new RegExp('Script error|' + getErrorMessage('st')));
          });
        });
      });
    });
  });

  function getErrorMessage(timerVarArgParam) {
    const version = Number(capabilities.version);
    if (capabilities.browserName === 'internet explorer' && version < 10) {
      // IE did not implement the var args variant of setTimeout and setInterval until version 10
      // https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout
      return 'This is intended for testing purposes: undefined';
    }
    return 'This is intended for testing purposes: ' + timerVarArgParam;
  }
});
