const {registerTestServerHooks, getE2ETestBaseUrl, getBeacons} = require('../../server/controls');
const {registerBaseHooks, exportCapabilities} = require('../base');
const {retry, expectOneMatching} = require('../../util');

const cexpect = require('chai').expect;

describe('08_unhandledRejections', () => {
  registerTestServerHooks();
  registerBaseHooks();

  let capabilities;
  exportCapabilities(_capabilities => capabilities = _capabilities);

  beforeEach(() => {
    browser.get(getE2ETestBaseUrl('08_unhandledRejections/unhandledRejection'));
  });

  it('must send error beacon for unhandled rejection', async () => {
    if (!/Chrome/i.test(capabilities.browserName) ||
        Number(capabilities.version) < 49) {
      return;
    }

    await element(by.id('clickError')).click();

    await retry(async () => {
      const beacons = await getBeacons();
      cexpect(beacons.filter(b => b.ty === 'err').length).to.equal(1);

      expectOneMatching(beacons, beacon => {
        cexpect(beacon.ty).to.equal('err');
        cexpect(beacon.e).to.have.a.string('Unrejected on purpose');
      });
    });

    const output = await element(by.id('output')).getText();
    cexpect(output).to.equal('Custom unhandledrejection listener called.');
  });

});
