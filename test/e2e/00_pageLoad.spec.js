const {registerTestServerHooks, getE2ETestBaseUrl, getBeacons} = require('../server/controls');
const {registerBaseHooks, skipInternetExplorer6} = require('./base');
const util = require('../util');

const cexpect = require('chai').expect;

describe('00_pageLoad', () => {
  registerTestServerHooks();
  registerBaseHooks();

  let start;

  beforeEach(() => {
    start = Date.now();
  });

  describe('00_pageLoad', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('00_pageLoad'));
    });

    it('must send pageLoad beacon', () => {
      return util.retry(() => {
        return getBeacons()
          .then(beacons => {
            cexpect(beacons).to.have.lengthOf(1);
          });
      });
    });

    it('must include basic page load information', () => {
      return util.retry(() => {
        return getBeacons()
          .then(([beacon]) => {
            cexpect(beacon.t).to.match(/[0-9a-f]{16}/i);

            // We cannot compare with start time due to saucelabs platforms not having
            // NTP properly configured…
            cexpect(beacon.r.length).to.be.at.least(String(start).length);
            cexpect(beacon.ts.length).to.be.below(6);
            cexpect(beacon.d.length).to.be.below(6);
          });
      });
    });
  });

  describe('00_meta', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('00_meta'));
    });

    it('must send simple meta data information', () => {
      return skipInternetExplorer6(() => {
        return util.retry(() => {
          return getBeacons()
            .then(([beacon]) => {
              cexpect(JSON.parse(beacon.m)).to.deep.equal({
                'user': 'tom.mason@example.com'
              });
            });
        });
      });
    });
  });

  describe('00_multiComplicatedMeta', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('00_multiComplicatedMeta'));
    });

    it('must send complicated meta data information', () => {
      return skipInternetExplorer6(() => {
        return util.retry(() => {
          return getBeacons()
            .then(([beacon]) => {
              cexpect(JSON.parse(beacon.m)).to.deep.equal({
                'user': 'tom.mason@example.com',
                'No&way': 'Ifyou\nHaveTo&DoThis'
              });
            });
        });
      });
    });
  });
});
