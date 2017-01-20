const {registerTestServerHooks, getE2ETestBaseUrl, getBeacons, getAjaxRequests} = require('../server/controls');
const {registerBaseHooks, whenConfigMatches} = require('./base');
const {retry, expectOneMatching} = require('../util');

const cexpect = require('chai').expect;

describe('01_xhr', () => {
  registerTestServerHooks();
  registerBaseHooks();

// disable for IE8 and below

  describe('01_xhrAfterPageLoad', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('01_xhrAfterPageLoad'));
    });

    it('must send beacons for XHR requests happening after page load', () => {
      return whenXhrInstrumentationIsSupported(() =>
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
                cexpect(beacon.l).to.equal(getE2ETestBaseUrl('01_xhrAfterPageLoad'));
                cexpect(beacon.ty).to.equal('xhr');
                cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
                cexpect(beacon.m).to.equal('GET');
                cexpect(beacon.u).to.match(/^\/ajax\?cacheBust=\d+$/);
                cexpect(beacon.a).to.equal('1');
                cexpect(beacon.st).to.equal('200');
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


  describe('01_xhrBeforePageLoad', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('01_xhrBeforePageLoad'));
    });

    it('must send beacons for XHR requests happenung before page load', () => {
      return whenXhrInstrumentationIsSupported(() =>
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


  describe('01_xhrBeforePageLoadSynchronous', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('01_xhrBeforePageLoadSynchronous'));
    });

    it('must send beacons for XHR requests happenung before page load', () => {
      return whenXhrInstrumentationIsSupported(() =>
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


  describe('01_xhrTimeout', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('01_xhrTimeout'));
    });

    it('must send error status when XHR times out', () => {
      return whenXhrInstrumentationIsSupported(config =>
        retry(() => {
          return Promise.all([getBeacons(), getResultElementContent()])
            .then(([beacons, result]) => {

              let expectedStatus = '-101';
              if (config.capabilities.browserName === 'internet explorer' && Number(config.capabilities.version) < 10) {
                expectedStatus = '-103';
              }

              expectOneMatching(beacons, beacon => {
                cexpect(beacon.s).to.match(/^[0-9A-F]{1,16}$/i);
                cexpect(beacon.t).to.equal(beacon.s);
                cexpect(beacon.st).to.equal(expectedStatus);
              });

              cexpect(result).to.equal('error');
            });
        })
      );
    });
  });


  function whenXhrInstrumentationIsSupported(fn) {
    return whenConfigMatches(
      config => config.capabilities.browserName !== 'internet explorer' || Number(config.capabilities.version) > 8,
      fn
    );
  }


  function getResultElementContent() {
    return element(by.id('result')).getText();
  }
});
