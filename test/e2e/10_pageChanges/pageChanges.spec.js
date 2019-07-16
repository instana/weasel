const {registerTestServerHooks, getE2ETestBaseUrl, getBeacons} = require('../../server/controls');
const {registerBaseHooks} = require('../base');
const {retry, expectOneMatching} = require('../../util');

const cexpect = require('chai').expect;

describe('10_pageChanges', () => {
  registerTestServerHooks();
  registerBaseHooks();

  describe('pageChanges', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('10_pageChanges/pageChanges'));
    });

    it('must send page change events', () => {
      return retry(async () => {
        const beacons = await getBeacons();

        const pageLoadBeacon = expectOneMatching(beacons, beacon => {
          cexpect(beacon.ty).to.equal('pl');
        });

        expectOneMatching(beacons, beacon => {
          cexpect(beacon.ty).to.equal('pc');
          cexpect(beacon.ts).to.be.a('string');
          cexpect(beacon.p).to.equal('first');
          cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
        });

        expectOneMatching(beacons, beacon => {
          cexpect(beacon.ty).to.equal('pc');
          cexpect(beacon.ts).to.be.a('string');
          cexpect(beacon.p).to.equal('second');
          cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
        });

        cexpect(beacons.filter(b => b.p === 'first' && b.ty === 'pc')).to.have.lengthOf(1);
        cexpect(beacons.filter(b => b.p === 'second' && b.ty === 'pc')).to.have.lengthOf(1);
      });
    });
  });

  describe('changingBackToPreviousPage', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('10_pageChanges/changingBackToPreviousPage'));
    });

    it('must send page change events', () => {
      return retry(async () => {
        const beacons = await getBeacons();

        const pageLoadBeacon = expectOneMatching(beacons, beacon => {
          cexpect(beacon.ty).to.equal('pl');
        });

        expectOneMatching(beacons, beacon => {
          cexpect(beacon.ty).to.equal('pc');
          cexpect(beacon.ts).to.be.a('string');
          cexpect(beacon.p).to.equal('first');
          cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
        });

        expectOneMatching(beacons, beacon => {
          cexpect(beacon.ty).to.equal('pc');
          cexpect(beacon.ts).to.be.a('string');
          cexpect(beacon.p).to.equal('second');
          cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
        });

        cexpect(beacons.filter(b => b.p === 'first' && b.ty === 'pc')).to.have.lengthOf(2);
        cexpect(beacons.filter(b => b.p === 'second' && b.ty === 'pc')).to.have.lengthOf(1);
      });
    });
  });

  describe('pageChangesDuringOnLoad', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('10_pageChanges/pageChangesDuringOnLoad'));
    });

    it('must send page change events', () => {
      return retry(async () => {
        const beacons = await getBeacons();

        const pageLoadBeacon = expectOneMatching(beacons, beacon => {
          cexpect(beacon.ty).to.equal('pl');
          cexpect(beacon.p).to.equal('second');
        });

        expectOneMatching(beacons, beacon => {
          cexpect(beacon.ty).to.equal('pc');
          cexpect(beacon.ts).to.be.a('string');
          cexpect(beacon.p).to.equal('second');
          cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
        });

        expectOneMatching(beacons, beacon => {
          cexpect(beacon.ty).to.equal('pc');
          cexpect(beacon.ts).to.be.a('string');
          cexpect(beacon.p).to.equal('third');
          cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
        });

        cexpect(beacons.filter(b => b.p === 'first' && b.ty === 'pc')).to.have.lengthOf(0);
        cexpect(beacons.filter(b => b.p === 'second' && b.ty === 'pc')).to.have.lengthOf(1);
        cexpect(beacons.filter(b => b.p === 'third' && b.ty === 'pc')).to.have.lengthOf(1);
      });
    });
  });
});
