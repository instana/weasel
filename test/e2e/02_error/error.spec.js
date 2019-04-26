const {registerTestServerHooks, getE2ETestBaseUrl, getBeacons} = require('../../server/controls');
const {retry, expectOneMatching} = require('../../util');
const {registerBaseHooks} = require('../base');

const cexpect = require('chai').expect;

describe('02_error', () => {
  registerTestServerHooks();
  registerBaseHooks();

  describe('automatic reporting', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('02_error/automatic'));
    });

    it('must send single error beacon', () => {
      return element(by.id('first')).click()
        .then(() => {
          return retry(() => {
            return getBeacons().then(beacons => {
              const pageLoadBeacon = expectOneMatching(beacons, beacon => {
                cexpect(beacon.ty).to.equal('pl');
              });

              expectOneMatching(beacons, beacon => {
                cexpect(beacon.ty).to.equal('err');
                cexpect(beacon.e).to.match(/This is intended for testing purposes/);
                cexpect(beacon.st).to.be.a('string');
                cexpect(beacon.c).to.equal('1');
                cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
              });
            });
          });
        });
    });

    it('must batch multiple errors', () => {
      return element(by.id('many')).click()
        .then(() => {
          return retry(() => {
            return getBeacons().then(beacons => {
              expectOneMatching(beacons, beacon => {
                cexpect(beacon.ty).to.equal('err');
                cexpect(beacon.e).to.match(/This is intended for testing purposes/);
                cexpect(beacon.c).to.equal('3');
              });

              expectOneMatching(beacons, beacon => {
                cexpect(beacon.ty).to.equal('err');
                cexpect(beacon.e).to.match(/Another error type/);
                cexpect(beacon.c).to.equal('1');
              });
            });
          });
        });
    });

    it('must ignore specific error messages', async () => {
      await element(by.id('ignored')).click();
      await element(by.id('second')).click();

      await retry(async () => {
        const beacons = await getBeacons();
        cexpect(beacons.length).to.equal(2);
        expectOneMatching(beacons, beacon => {
          cexpect(beacon.ty).to.equal('err');
          cexpect(beacon.e).to.match(/Another error type/);
          cexpect(beacon.c).to.equal('1');
        });
      });
    });
  });

  describe('manual reporting with error object', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('02_error/manualWithErrorObject'));
    });

    it('must support manual error reporting', () => {
      return retry(() => {
        return getBeacons().then(beacons => {
          const pageLoadBeacon = expectOneMatching(beacons, beacon => {
            cexpect(beacon.ty).to.equal('pl');
          });

          expectOneMatching(beacons, beacon => {
            cexpect(beacon.ty).to.equal('err');
            cexpect(beacon.e).to.match(/Testing 123/);
            cexpect(beacon.st).to.be.a('string');
            cexpect(beacon.c).to.equal('1');
            cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
            cexpect(beacon.cs).to.equal('a component stack');
          });
        });
      });
    });
  });

  describe('manual reporting with error string', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('02_error/manualWithErrorString'));
    });

    it('must support manual error reporting', () => {
      return retry(() => {
        return getBeacons().then(beacons => {
          const pageLoadBeacon = expectOneMatching(beacons, beacon => {
            cexpect(beacon.ty).to.equal('pl');
          });

          expectOneMatching(beacons, beacon => {
            cexpect(beacon.ty).to.equal('err');
            cexpect(beacon.e).to.equal('Failed to change route');
            cexpect(beacon.st).to.equal('');
            cexpect(beacon.c).to.equal('1');
            cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
            cexpect(beacon.cs).to.equal(undefined);
          });
        });
      });
    });
  });
});
