const {registerTestServerHooks, getE2ETestBaseUrl, getBeacons} = require('../../server/controls');
const {registerBaseHooks, getCapabilities} = require('../base');
const util = require('../../util');

const cexpect = require('chai').expect;

describe('14_backendTraceId', () => {
  registerTestServerHooks();
  registerBaseHooks();

  beforeEach(() => {
    browser.get(getE2ETestBaseUrl('14_backendTraceId/backendTraceId_check'));
  });
  it('must check if backend trace ID is available in transmitted beacon', () => {
    return getCapabilities().then(capabilities => {
      if (!hasServerTimingSupport(capabilities)) {
        return;
      }

      return util.retry(() => {
        return getBeacons()
          .then(beacons => {
            cexpect(beacons).to.have.lengthOf(33);
            const xhrBeacons = beacons.filter(beacon => beacon.ty === 'xhr');
            xhrBeacons.forEach(xhrBeacon => {
              cexpect(xhrBeacon.bt).to.not.equal(undefined);
              cexpect(xhrBeacon.bt).to.equal('aFakeBackendTraceIdForTests');
            });
          });
      });
    });
  });

  function hasServerTimingSupport(capabilities) {
    const version = Number(capabilities.version);
    return capabilities.browserName === 'chrome' && (capabilities.version == null || version >= 65);
  }
});
