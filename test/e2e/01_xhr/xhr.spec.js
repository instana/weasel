const {registerTestServerHooks, getE2ETestBaseUrl, getBeacons, getAjaxRequests} = require('../../server/controls');
const {registerBaseHooks, whenConfigMatches, getCapabilities, hasPerformanceObserverSupport} = require('../base');
const {retry, expectOneMatching} = require('../../util');

const cexpect = require('chai').expect;

describe('xhr', () => {
  registerTestServerHooks();
  registerBaseHooks();

  describe('xhrAfterPageLoad', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('01_xhr/xhrAfterPageLoad'));
    });

    it('must send beacons for XHR requests happening after page load', () => {
      return whenXhrInstrumentationIsSupported(() =>
        retry(() => {
          return Promise.all([getBeacons(), getAjaxRequests(), getResultElementContent(), getCapabilities()])
            .then(([beacons, ajaxRequests, result, capabilities]) => {
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
                cexpect(beacon.l).to.equal(getE2ETestBaseUrl('01_xhr/xhrAfterPageLoad'));
                cexpect(beacon.ty).to.equal('xhr');
                cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
                cexpect(beacon.m).to.equal('GET');
                cexpect(beacon.u).to.match(/^http:\/\/127\.0\.0\.1:8000\/ajax\?cacheBust=\d+$/);
                cexpect(beacon.a).to.equal('1');
                cexpect(beacon.st).to.equal('200');
                cexpect(beacon.bc).to.equal('1');
                cexpect(beacon.ph).to.equal(undefined);

                if (hasPerformanceObserverSupport(capabilities)) {
                  cexpect(beacon.t_req).to.be.a('string');
                }
              });

              const ajaxRequest = expectOneMatching(ajaxRequests, ajaxRequest => {
                cexpect(ajaxRequest.method).to.equal('GET');
                cexpect(ajaxRequest.url).to.match(/^\/ajax\?cacheBust=\d+$/);
                cexpect(ajaxRequest.headers['x-instana-t']).to.equal(ajaxBeacon.t);
                cexpect(ajaxRequest.headers['x-instana-s']).to.equal(ajaxBeacon.s);
                cexpect(ajaxRequest.headers['x-instana-l']).to.equal('1,correlationType=web;correlationId=' + ajaxBeacon.t);
              });

              cexpect(result).to.equal(ajaxRequest.response);
            });
        })
      );
    });

    it('must report visibility state at time of request execution', () => {
      // This test fails reproducible on IE 9, so we exclude it there. The better alternative would be to analyze this
      // thoroughly, but with IE 9 usage at 0.13% the cost/value ratio simply does not justify the effort.
      return whenDocumentVisibilityApiIsSupported(() =>
        retry(() => {
          return getBeacons()
            .then(beacons => {
              expectOneMatching(beacons, beacon => {
                cexpect(beacon.ty).to.equal('xhr');
                cexpect(beacon.h).to.equal('0');
              });
            });
        })
      );
    });
  });


  describe('xhrBeforePageLoad', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('01_xhr/xhrBeforePageLoad'));
    });

    it('must send beacons for XHR requests happening before page load', () => {
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
                cexpect(beacon.t).to.equal(beacon.s);
                cexpect(beacon.ty).to.equal('xhr');
                cexpect(beacon.ph).to.equal('pl');
                cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
              });

              const ajaxRequest = expectOneMatching(ajaxRequests, ajaxRequest => {
                cexpect(ajaxRequest.method).to.equal('GET');
                cexpect(ajaxRequest.url).to.match(/^\/ajax\?cacheBust=\d+$/);
                cexpect(ajaxRequest.headers['x-instana-t']).to.equal(ajaxBeacon.t);
                cexpect(ajaxRequest.headers['x-instana-s']).to.equal(ajaxBeacon.s);
                cexpect(ajaxRequest.headers['x-instana-l']).to.equal('1,correlationType=web;correlationId=' + ajaxBeacon.t);
              });

              cexpect(result).to.equal(ajaxRequest.response);
            });
        })
      );
    });
  });


  describe('xhrBeforePageLoadSynchronous', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('01_xhr/xhrBeforePageLoadSynchronous'));
    });

    it('must send beacons for XHR requests happening before page load', () => {
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
                cexpect(beacon.t).to.equal(beacon.s);
                cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
                cexpect(beacon.ty).to.equal('xhr');
              });

              const ajaxRequest = expectOneMatching(ajaxRequests, ajaxRequest => {
                cexpect(ajaxRequest.method).to.equal('GET');
                cexpect(ajaxRequest.url).to.match(/^\/ajax\?cacheBust=\d+$/);
                cexpect(ajaxRequest.headers['x-instana-t']).to.equal(ajaxBeacon.t);
                cexpect(ajaxRequest.headers['x-instana-s']).to.equal(ajaxBeacon.s);
                cexpect(ajaxRequest.headers['x-instana-l']).to.equal('1,correlationType=web;correlationId=' + ajaxBeacon.t);
              });

              cexpect(result).to.equal(ajaxRequest.response);
            });
        })
      );
    });
  });


  describe('xhrTimeout', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('01_xhr/xhrTimeout'));
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


  describe('ignoredXhr', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('01_xhr/ignoredXhr'));
    });

    it('must ignore certain XHR calls', () => {
      return whenXhrInstrumentationIsSupported(() =>
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


  describe('xhrError', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('01_xhr/xhrError'));
    });

    it('must send erroneous beacons for failed XHR requests', () => {
      // This test fails reproducible on IE 9, so we exclude it there. The better alternative would be to analyze this
      // thoroughly, but with IE 9 usage at 0.13% the cost/value ratio simply does not justify the effort.
      return whenXhrInstrumentationWithErrorHandlingIsSupported(() =>
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
                cexpect(beacon.l).to.equal(getE2ETestBaseUrl('01_xhr/xhrError'));
                cexpect(beacon.ty).to.equal('xhr');
                cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
                cexpect(beacon.m).to.equal('GET');
                cexpect(beacon.u).to.match(/^invalidprotocol:\/\/lets-cause-a-network-error-shall-we\/\?cacheBust=\d+$/);
                cexpect(beacon.a).to.equal('1');
                cexpect(beacon.st).to.be.oneOf(['-103', '-102']);
                cexpect(beacon.bc).to.equal('0');
              });

              cexpect(result).to.equal('expected error');
            });
        })
      );
    });
  });

  describe('xhrStripSecrets', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('01_xhr/xhrStripSecrets'));
    });

    it('must strip secrets from url in send beacons', () => {
      return whenXhrInstrumentationIsSupported(() =>
        retry(() => {
          return Promise.all([getBeacons()])
            .then(([beacons]) => {
              cexpect(beacons).to.have.lengthOf(2);

              expectOneMatching(beacons, beacon => {
                cexpect(beacon.ty).to.equal('xhr');
                cexpect(beacon.u).to.match(/^http:\/\/127\.0\.0\.1:8000\/ajax\?mysecret=<redacted>&myaccountno=<redacted>&phone=999$/);
              });
            });
        })
      );
    });
  });

  describe('xhrCaptureHeaders', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('01_xhr/xhrCaptureHeaders'));
    });

    it('must capture the http headers configured by user in xhr request', () => {
      return whenXhrInstrumentationIsSupported(() =>
        retry(() => {
          return Promise.all([getBeacons(), getAjaxRequests(), getResultElementContent(), getCapabilities()])
            .then(([beacons, ajaxRequests, result]) => {
              cexpect(beacons).to.have.lengthOf(2);
              cexpect(ajaxRequests).to.have.lengthOf(1);

              expectOneMatching(beacons, beacon => {
                cexpect(beacon['l']).to.equal(getE2ETestBaseUrl('01_xhr/xhrCaptureHeaders'));
                cexpect(beacon['ty']).to.equal('xhr');
                cexpect(beacon['u']).to.match(/^http:\/\/127\.0\.0\.1:8000\/ajax\?cacheBust=\d+$/);

                cexpect(beacon['h_provider']).to.equal('instana');
                cexpect(beacon['h_content-type']).to.equal('text/html; charset=utf-8');
              });

              const ajaxRequest = expectOneMatching(ajaxRequests, ajaxRequest => {
                cexpect(ajaxRequest.headers['host']).to.equal('127.0.0.1:8000');
              });

              cexpect(result).to.equal(ajaxRequest.response);
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


  function whenXhrInstrumentationWithErrorHandlingIsSupported(fn) {
    return whenConfigMatches(
      config => config.capabilities.browserName !== 'internet explorer' || Number(config.capabilities.version) > 9,
      fn
    );
  }


  function whenDocumentVisibilityApiIsSupported(fn) {
    return whenConfigMatches(
      config => config.capabilities.browserName === 'chrome',
      fn
    );
  }


  function getResultElementContent() {
    return element(by.id('result')).getText();
  }
});
