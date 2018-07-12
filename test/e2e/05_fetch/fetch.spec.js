const {registerTestServerHooks, getE2ETestBaseUrl, getBeacons, getAjaxRequests} = require('../../server/controls');
const {registerBaseHooks, whenConfigMatches} = require('../base');
const {retry, expectOneMatching} = require('../../util');

const cexpect = require('chai').expect;

describe('05_fetch', () => {
  registerTestServerHooks();
  registerBaseHooks();

  describe('05_fetchAfterPageLoad', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('05_fetch/afterPageLoad'));
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
                cexpect(beacon.l).to.equal(getE2ETestBaseUrl('05_fetch/afterPageLoad'));
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
                cexpect(ajaxRequest.headers['from']).to.equal('stan@instana.com');
              });

              cexpect(result).to.equal(ajaxRequest.response);
            });
        })
      );
    });
  });


  describe('05_fetchRequestObject', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('05_fetch/requestObject'));
    });

    it('must send beacons for fetch requests with a Request object', () => {
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
                cexpect(beacon.l).to.equal(getE2ETestBaseUrl('05_fetch/requestObject'));
                cexpect(beacon.ty).to.equal('xhr');
                cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
                cexpect(beacon.m).to.equal('POST');
                cexpect(beacon.u).to.match(/^http:\/\/127\.0\.0\.1:8000\/ajax\?cacheBust=\d+$/);
                cexpect(beacon.a).to.equal('1');
                cexpect(beacon.st).to.equal('200');
                cexpect(beacon.bc).to.equal('1');
                cexpect(beacon.e).to.be.undefined;
              });

              const ajaxRequest = expectOneMatching(ajaxRequests, ajaxRequest => {
                cexpect(ajaxRequest.method).to.equal('POST');
                cexpect(ajaxRequest.url).to.match(/^\/ajax\?cacheBust=\d+$/);
                cexpect(ajaxRequest.headers['x-instana-t']).to.equal(ajaxBeacon.t);
                cexpect(ajaxRequest.headers['x-instana-s']).to.equal(ajaxBeacon.s);
                cexpect(ajaxRequest.headers['x-instana-l']).to.equal('1');
                cexpect(ajaxRequest.headers['from']).to.equal('stan@instana.com');
              });

              cexpect(result).to.equal(ajaxRequest.response);
            });
        })
      );
    });
  });


  describe('05_fetchRequestObjectAndInitObject', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('05_fetch/requestObjectAndInitObject'));
    });

    it('must handle request and init object correctly', () => {
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
                cexpect(beacon.l).to.equal(getE2ETestBaseUrl('05_fetch/requestObjectAndInitObject'));
                cexpect(beacon.ty).to.equal('xhr');
                cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
                cexpect(beacon.m).to.equal('POST');
                cexpect(beacon.u).to.match(/^http:\/\/127\.0\.0\.1:8000\/ajax\?cacheBust=\d+$/);
                cexpect(beacon.a).to.equal('1');
                cexpect(beacon.st).to.equal('200');
                cexpect(beacon.bc).to.equal('1');
                cexpect(beacon.e).to.be.undefined;
              });

              const ajaxRequest = expectOneMatching(ajaxRequests, ajaxRequest => {
                cexpect(ajaxRequest.method).to.equal('POST');
                cexpect(ajaxRequest.url).to.match(/^\/ajax\?cacheBust=\d+$/);
                cexpect(ajaxRequest.headers['x-instana-t']).to.equal(ajaxBeacon.t);
                cexpect(ajaxRequest.headers['x-instana-s']).to.equal(ajaxBeacon.s);
                cexpect(ajaxRequest.headers['x-instana-l']).to.equal('1');
                cexpect(ajaxRequest.headers['from']).to.equal('stan@instana.com');
              });

              cexpect(result).to.equal(ajaxRequest.response);
            });
        })
      );
    });
  });


  describe('05_fetchBeforePageLoad', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('05_fetch/beforePageLoad'));
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
      browser.get(getE2ETestBaseUrl('05_fetch/ignoredFetch'));
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
      browser.get(getE2ETestBaseUrl('05_fetch/error'));
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
                cexpect(beacon.l).to.equal(getE2ETestBaseUrl('05_fetch/error'));
                cexpect(beacon.ty).to.equal('xhr');
                cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
                cexpect(beacon.m).to.equal('GET');
                cexpect(beacon.u).to.match(/^invalidprotocol:\/\/lets-cause-a-network-error-shall-we\/\?cacheBust=\d+$/);
                cexpect(beacon.a).to.equal('1');
                cexpect(beacon.st).to.equal('0');
                cexpect(beacon.bc).to.equal('0');
                cexpect(beacon.e).to.be.oneOf([
                  // Chrome says:
                  'Failed to fetch',
                  // IE says:
                  'NetworkError when attempting to fetch resource.',
                  // Safari 11.1 complains about CORS (because it is an absolute URL) before even attempting to do
                  // the network request:
                  'Cross origin requests are only supported for HTTP.',
                  // Safari 10.1 and 11.0 say:
                  'Type error',
                  // MS Edge 14.x says:
                  'TypeMismatchError'
                ]);
              });

              cexpect(result).to.equal('catched an error');
            });
        })
      );
    });
  });


  describe('05_withPolyfill', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('05_fetch/withPolyfill'));
    });

    it('must send only send beacons once, not for fetch and XHR', () => {
      // Note: No whenFetchIsSupported here, this must work in all browsers
      // that support XHR instrumentation.
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
                cexpect(beacon.l).to.equal(getE2ETestBaseUrl('05_fetch/withPolyfill'));
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
                cexpect(ajaxRequest.headers['from']).to.equal('stan@instana.com');
              });

              cexpect(result).to.equal(ajaxRequest.response);
            });
        })
      );
    });
  });


  function whenFetchIsSupported(fn) {
    return whenConfigMatches(
      config => {
        if (config.capabilities.browserName === 'internet explorer') {
          return false;
        }
        if (config.capabilities.browserName === 'safari' && Number(config.capabilities.version) < 10) {
          return false;
        }
        return true;
      },
      fn
    );
  }


  function whenXhrInstrumentationIsSupported(fn) {
    return whenConfigMatches(
      config => config.capabilities.browserName !== 'internet explorer' || Number(config.capabilities.version) > 9,
      fn
    );
  }


  function getResultElementContent() {
    return element(by.id('result')).getText();
  }
});
