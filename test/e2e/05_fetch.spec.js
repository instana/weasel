const {registerTestServerHooks, getE2ETestBaseUrl, getBeacons, getAjaxRequests} = require('../server/controls');
const {registerBaseHooks, whenConfigMatches} = require('./base');
const {retry, expectOneMatching} = require('../util');

const cexpect = require('chai').expect;

describe('05_fetch', () => {
  registerTestServerHooks();
  registerBaseHooks();

  describe('05_fetchAfterPageLoad', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('05_fetchAfterPageLoad'));
    });

    it('must send beacons for fetch requests happening after page load', () => {
      return whenFetchIsSupported(() =>
        retry(() => {
          return Promise.all([getBeacons(), getAjaxRequests(), getResultElementContent()])
            .then(([beacons, ajaxRequests, result]) => {
              cexpect(beacons).to.have.lengthOf(2);
              cexpect(ajaxRequests).to.have.lengthOf(1);

              const pageLoadBeacon = expectOneMatching(beacons, beacon => {
                cexpect(beacon.s).to.equal(undefined);
              });

              const ajaxBeacon = expectOneMatching(beacons, beacon => {
                cexpect(beacon.t).to.match(/^[0-9A-F]{1,16}$/i);
                cexpect(beacon.t).to.equal(beacon.s);
                cexpect(beacon.r).not.to.be.NaN;
                cexpect(beacon.ts).not.to.be.NaN;
                cexpect(beacon.d).not.to.be.NaN;
                cexpect(beacon.l).to.equal(getE2ETestBaseUrl('05_fetchAfterPageLoad'));
                cexpect(beacon.ty).to.equal('xhr');
                cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
                cexpect(beacon.m).to.equal('GET');
                cexpect(beacon.u).to.match(/^http:\/\/127\.0\.0\.1:8000\/ajax\?cacheBust=\d+$/);
                cexpect(beacon.a).to.equal('1');
                cexpect(beacon.st).to.equal('200');
                cexpect(beacon.bc).to.equal('1');
                cexpect(beacon.e).to.be.undefined;
              });

              const ajaxRequest = expectOneMatching(ajaxRequests, ajaxRequest => {
                cexpect(ajaxRequest.method).to.equal('GET');
                cexpect(ajaxRequest.url).to.match(/^\/ajax\?cacheBust=\d+$/);
                cexpect(ajaxRequest.headers['x-instana-t']).to.equal(ajaxBeacon.t);
                cexpect(ajaxRequest.headers['x-instana-s']).to.equal(ajaxBeacon.s);
                cexpect(ajaxRequest.headers['x-instana-l']).to.equal('1');
              });

              cexpect(result).to.equal(ajaxRequest.response);
            });
        })
      );
    });
  });


  describe('05_fetchBeforePageLoad', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('05_fetchBeforePageLoad'));
    });

    it('must send beacons for fetch requests happening before page load', () => {
      return whenFetchIsSupported(() =>
        retry(() => {
          return Promise.all([getBeacons(), getAjaxRequests(), getResultElementContent()])
            .then(([beacons, ajaxRequests, result]) => {
              cexpect(beacons).to.have.lengthOf(2);
              cexpect(ajaxRequests).to.have.lengthOf(1);

              const pageLoadBeacon = expectOneMatching(beacons, beacon => {
                cexpect(beacon.s).to.equal(undefined);
              });

              const ajaxBeacon = expectOneMatching(beacons, beacon => {
                cexpect(beacon.s).to.match(/^[0-9A-F]{1,16}$/i);
                cexpect(beacon.t).not.to.equal(beacon.s);
                cexpect(beacon.t).to.equal(pageLoadBeacon.t);
                cexpect(beacon.ty).to.equal('xhr');
                cexpect(beacon.e).to.be.undefined;
              });

              const ajaxRequest = expectOneMatching(ajaxRequests, ajaxRequest => {
                cexpect(ajaxRequest.method).to.equal('GET');
                cexpect(ajaxRequest.url).to.match(/^\/ajax\?cacheBust=\d+$/);
                cexpect(ajaxRequest.headers['x-instana-t']).to.equal(pageLoadBeacon.t);
                cexpect(ajaxRequest.headers['x-instana-s']).to.equal(ajaxBeacon.s);
                cexpect(ajaxRequest.headers['x-instana-l']).to.equal('1');
              });

              cexpect(result).to.equal(ajaxRequest.response);
            });
        })
      );
    });
  });


  describe('05_ignoredFetch', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('05_ignoredFetch'));
    });

    it('must ignore certain fetch calls', () => {
      return whenFetchIsSupported(() =>
        retry(() => {
          return Promise.all([getBeacons(), getAjaxRequests(), getResultElementContent()])
            .then(([beacons, ajaxRequests, result]) => {
              const pageLoadBeacon = expectOneMatching(beacons, beacon => {
                cexpect(beacon.ty).to.equal('pl');
                cexpect(beacon.s).to.equal(undefined);
              });

              expectOneMatching(beacons, beacon => {
                cexpect(beacon.ty).to.equal('xhr');
                cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
                cexpect(beacon.u).to.match(/^http:\/\/127\.0\.0\.1:8000\/ajax\?cacheBust=\d+$/);
                cexpect(beacon.e).to.be.undefined;
              });

              const ajaxRequest = expectOneMatching(ajaxRequests, ajaxRequest => {
                cexpect(ajaxRequest.method).to.equal('GET');
                cexpect(ajaxRequest.url).to.match(/^\/ajax\?cacheBust=\d+$/);
              });

              cexpect(result).to.equal(ajaxRequest.response);

              cexpect(ajaxRequests.length).to.equal(2);
              cexpect(beacons.length).to.equal(2);
            });
        })
      );
    });
  });


  describe('05_fetchError', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('05_fetchError'));
    });

    it('must send erroneous beacons for failed fetch requests', () => {
      return whenFetchIsSupported(() =>
        retry(() => {
          return Promise.all([getBeacons(), getAjaxRequests(), getResultElementContent()])
            .then(([beacons, ajaxRequests, result]) => {
              cexpect(beacons).to.have.lengthOf(2);
              cexpect(ajaxRequests).to.have.lengthOf(0);

              const pageLoadBeacon = expectOneMatching(beacons, beacon => {
                cexpect(beacon.s).to.equal(undefined);
              });

              expectOneMatching(beacons, beacon => {
                cexpect(beacon.t).to.match(/^[0-9A-F]{1,16}$/i);
                cexpect(beacon.t).to.equal(beacon.s);
                cexpect(beacon.r).not.to.be.NaN;
                cexpect(beacon.ts).not.to.be.NaN;
                cexpect(beacon.d).not.to.be.NaN;
                cexpect(beacon.l).to.equal(getE2ETestBaseUrl('05_fetchError'));
                cexpect(beacon.ty).to.equal('xhr');
                cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
                cexpect(beacon.m).to.equal('GET');
                cexpect(beacon.u).to.match(/^invalidprotocol:\/\/lets-cause-a-network-error-shall-we\?cacheBust=\d+$/);
                cexpect(beacon.a).to.equal('1');
                cexpect(beacon.st).to.equal('0');
                cexpect(beacon.bc).to.equal('0');
                cexpect(beacon.e).to.be.oneOf([
                  'Failed to fetch',
                  'NetworkError when attempting to fetch resource.'
                ]);
              });

              cexpect(result).to.equal('catched an error');
            });
        })
      );
    });
  });


  function whenFetchIsSupported(fn) {
    return whenConfigMatches(
      config => config.capabilities.browserName !== 'internet explorer',
      fn
    );
  }


  function getResultElementContent() {
    return element(by.id('result')).getText();
  }
});
