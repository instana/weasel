const {registerTestServerHooks, getE2ETestBaseUrl, getBeacons} = require('../server/controls');
const {registerBaseHooks, getCapabilities} = require('./base');
const util = require('../util');

const cexpect = require('chai').expect;

describe('04_serverTiming', () => {
  registerTestServerHooks();
  registerBaseHooks();

  beforeEach(() => {
    browser.get(getE2ETestBaseUrl('04_serverTiming'));
  });

  it('must read backend trace ID when available from server timing header', () => {
    return getCapabilities().then(capabilities => {
      if (!hasServerTimingSupport(capabilities)) {
        return;
      }

      return util.retry(() => {
        return getBeacons()
          .then(beacons => {
            cexpect(beacons).to.have.lengthOf(1);
            cexpect(beacons[0].bt).to.equal('aFakeBackendTraceIdForTests');
          });
      });
    });
  });

  function hasServerTimingSupport(capabilities) {
    const version = Number(capabilities.version);
    return capabilities.browserName === 'chrome' && (capabilities.version == null || version >= 65);
  }
});
