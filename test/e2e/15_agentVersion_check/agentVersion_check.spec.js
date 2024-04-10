const {registerTestServerHooks, getE2ETestBaseUrl, getBeacons} = require('../../server/controls');
const {registerBaseHooks} = require('../base');
const util = require('../../util');

const cexpect = require('chai').expect;

describe('15_agentVersion_check', () => {
  registerTestServerHooks();
  registerBaseHooks();

  beforeEach(() => {
    browser.get(getE2ETestBaseUrl('15_agentVersion_check/agentVersion_check'));
  });

  it('must check if agentVersion is available in transmitted beacon', () => {
    return util.retry(() => {
      return getBeacons()
        .then(beacons => {
          beacons.forEach(beacon => {
            cexpect(beacon.agv).to.not.equal(undefined);
            cexpect(beacon.agv).to.equal('0.0.0');
          });
        });
    });
  });
});
