const { registerTestServerHooks, getE2ETestBaseUrl, getBeacons } = require('../../server/controls');
const { registerBaseHooks, getCapabilities } = require('../base');
const { retry, expectOneMatching } = require('../../util');

const cexpect = require('chai').expect;

fdescribe('11_csp', () => {
  registerTestServerHooks();
  registerBaseHooks();

  describe('with resource blocking', () => {
    beforeEach(() => {
      browser.get(
        getE2ETestBaseUrl('11_csp/csp', {
          csp: true
        })
      );
    });

    it('must report violations', async () => {
      const { browserName } = await getCapabilities();
      if (browserName !== 'chrome') {
        return;
      }

      return retry(async () => {
        const beacons = await getBeacons();

        const pageLoadBeacon = expectOneMatching(beacons, beacon => {
          cexpect(beacon.ty).to.equal('pl');
        });

        expectOneMatching(beacons, beacon => {
          cexpect(beacon.ty).to.equal('csp');
          cexpect(beacon.ts).to.be.a('string');
          cexpect(beacon.pl).to.equal(pageLoadBeacon.t);

          cexpect(beacon.bu).to.be.oneOf([
            'https://maxcdn.bootstrapcdn.com',
            'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css'
          ]);
          cexpect(beacon.ed).be.a('string');
          cexpect(beacon.vd).be.a('string');
          cexpect(beacon.op).to.be.a('string');
          cexpect(beacon.st).to.equal('200');
          cexpect(beacon.sf).to.be.a('string');
        });
      });
    });
  });
});
