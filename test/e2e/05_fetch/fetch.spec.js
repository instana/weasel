const {registerTestServerHooks, getE2ETestBaseUrl, getBeacons, getAjaxRequests} = require('../../server/controls');
const {registerBaseHooks, whenConfigMatches, getCapabilities, hasPerformanceObserverSupport} = require('../base');
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
                cexpect(beacon.ts).not.to.equal('0');
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
                cexpect(ajaxRequest.headers['from']).to.equal('stan@instana.com');
              });

              cexpect(result).to.equal(ajaxRequest.response);
            });
        })
      );
    });
  });

  describe('05_fetchNoZoneImpact', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('05_fetch/fetchNoZoneImpact'));
    });

    it('must not add any work to non-root Zones', () => {
      return whenFetchIsSupported(() =>
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
                cexpect(beacon.ts).not.to.equal('0');
                cexpect(beacon.d).not.to.be.NaN;
                cexpect(beacon.l).to.equal(getE2ETestBaseUrl('05_fetch/fetchNoZoneImpact'));
                cexpect(beacon.ty).to.equal('xhr');
                cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
                cexpect(beacon.m).to.equal('GET');
                cexpect(beacon.u).to.match(/^http:\/\/127\.0\.0\.1:8000\/ajax\?cacheBust=\d+$/);
                cexpect(beacon.a).to.equal('1');
                cexpect(beacon.st).to.equal('200');
                cexpect(beacon.bc).to.equal('1');
                cexpect(beacon.e).to.be.undefined;

                if (hasPerformanceObserverSupport(capabilities)) {
                  cexpect(beacon.t_req).to.be.a('string');
                }
              });

              expectOneMatching(ajaxRequests, ajaxRequest => {
                cexpect(ajaxRequest.method).to.equal('GET');
                cexpect(ajaxRequest.url).to.match(/^\/ajax\?cacheBust=\d+$/);
                cexpect(ajaxRequest.headers['x-instana-t']).to.equal(ajaxBeacon.t);
                cexpect(ajaxRequest.headers['x-instana-s']).to.equal(ajaxBeacon.s);
                cexpect(ajaxRequest.headers['x-instana-l']).to.equal('1,correlationType=web;correlationId=' + ajaxBeacon.t);
                cexpect(ajaxRequest.headers['from']).to.equal('stan@instana.com');
              });

              cexpect(result).to.equal('0');
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
                cexpect(ajaxRequest.headers['x-instana-l']).to.equal('1,correlationType=web;correlationId=' + ajaxBeacon.t);
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
                cexpect(ajaxRequest.headers['x-instana-l']).to.equal('1,correlationType=web;correlationId=' + ajaxBeacon.t);
                cexpect(ajaxRequest.headers['from']).to.equal('stan@instana.com');
              });

              cexpect(result).to.equal(ajaxRequest.response);
            });
        })
      );
    });
  });

  describe('05_fetchRequestObjectAndInitObjectWithoutHeaders', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('05_fetch/requestObjectAndInitObjectWithoutHeaders'));
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
                cexpect(beacon.l).to.equal(getE2ETestBaseUrl('05_fetch/requestObjectAndInitObjectWithoutHeaders'));
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
                cexpect(ajaxRequest.headers['x-instana-l']).to.equal('1,correlationType=web;correlationId=' + ajaxBeacon.t);
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
                cexpect(beacon.t).to.equal(beacon.s);
                cexpect(beacon.pl).to.equal(pageLoadBeacon.t);
                cexpect(beacon.ty).to.equal('xhr');
                cexpect(beacon.e).to.be.undefined;
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

              cexpect(ajaxRequests.length).to.equal(3);
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
                cexpect(beacon.st).to.equal('-103');
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

              cexpect(beacons).to.have.lengthOf(2);
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
                cexpect(ajaxRequest.headers['x-instana-l']).to.equal('1,correlationType=web;correlationId=' + ajaxBeacon.t);
                cexpect(ajaxRequest.headers['from']).to.equal('stan@instana.com');
              });

              cexpect(result).to.equal(ajaxRequest.response);
            });
        })
      );
    });
  });

  describe('05_graphql_apollo', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('05_fetch/graphql_apollo'));
    });

    it('must instrument Apollo GraphQL HTTP calls', () => {
      return whenFetchIsSupported(() =>
        retry(async () => {
          const result = await getResultElementContent();
          cexpect(result).to.equal('Done!');

          const beacons = await getBeacons();
          cexpect(beacons).to.have.lengthOf(6);

          expectOneMatching(beacons, beacon => {
            cexpect(beacon.ty).to.equal('xhr');
            cexpect(beacon.gon).to.equal('Book');
            cexpect(beacon.got).to.equal('query');
          });

          expectOneMatching(beacons, beacon => {
            cexpect(beacon.ty).to.equal('xhr');
            cexpect(beacon.gon).to.equal('Books');
            cexpect(beacon.got).to.equal('query');
          });

          expectOneMatching(beacons, beacon => {
            cexpect(beacon.ty).to.equal('xhr');
            cexpect(beacon.gon).to.equal(undefined);
            cexpect(beacon.got).to.equal('query');
          });

          expectOneMatching(beacons, beacon => {
            cexpect(beacon.ty).to.equal('xhr');
            cexpect(beacon.gon).to.equal('Borrow');
            cexpect(beacon.got).to.equal('mutation');
          });

          expectOneMatching(beacons, beacon => {
            cexpect(beacon.ty).to.equal('xhr');
            cexpect(beacon.gon).to.equal(undefined);
            cexpect(beacon.got).to.equal('mutation');
          });
        })
      );
    });
  });

  describe('05_fetchStripScerets', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('05_fetch/fetchStripSecrets'));
    });

    it('must strip secrets from url in send beacons', () => {
      return whenFetchIsSupported(() =>
        retry(() => {
          return Promise.all([getBeacons()]).then(([beacons]) => {
            cexpect(beacons).to.have.lengthOf(2);

            expectOneMatching(beacons, beacon => {
              cexpect(beacon.ty).to.equal('xhr');
              cexpect(beacon.u).to.match(
                /^http:\/\/127\.0\.0\.1:8000\/ajax\?mysecret=<redacted>&myaccountno=<redacted>&phone=999$/
              );
            });
          });
        })
      );
    });
  });

  describe('05_fetchCaptureHeaders', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('05_fetch/captureHeaders'));
    });

    it('must capture headers in fetch requests', () => {
      return whenFetchIsSupported(() =>
        retry(() => {
          return Promise.all([getBeacons(), getAjaxRequests(), getResultElementContent(), getCapabilities()])
            .then(([beacons, ajaxRequests, result, capabilities]) => {
              cexpect(beacons).to.have.lengthOf(2);
              cexpect(ajaxRequests).to.have.lengthOf(1);

              expectOneMatching(beacons, beacon => {
                cexpect(beacon['l']).to.equal(getE2ETestBaseUrl('05_fetch/captureHeaders'));
                cexpect(beacon['ty']).to.equal('xhr');
                cexpect(beacon['u']).to.match(/^http:\/\/127\.0\.0\.1:8000\/ajax\?cacheBust=\d+$/);
                cexpect(beacon['h_content-type']).to.equal('text/html; charset=utf-8');
                cexpect(beacon['h_from']).to.equal('stan@instana.com');

                if (hasPerformanceObserverSupport(capabilities)) {
                  cexpect(beacon.t_req).to.be.a('string');
                }
              });

              const ajaxRequest = expectOneMatching(ajaxRequests, ajaxRequest => {
                cexpect(ajaxRequest.url).to.match(/^\/ajax\?cacheBust=\d+$/);
                cexpect(ajaxRequest.headers['from']).to.equal('stan@instana.com');
                cexpect(ajaxRequest.headers['host']).to.equal('127.0.0.1:8000');
              });

              cexpect(result).to.equal(ajaxRequest.response);
            });
        })
      );
    });
  });

  describe('05_fetchWithFormData', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('05_fetch/fetchWithFormData'));
    });

    it('must send form data in fetch requests', () => {
      return whenFetchIsSupported(() =>
        retry(() => {
          return Promise.all([getBeacons(), getAjaxRequests(), getResultElementContent(), getCapabilities()])
            .then(([beacons, ajaxRequests, result, capabilities]) => {
              cexpect(beacons).to.have.lengthOf(2);
              cexpect(ajaxRequests).to.have.lengthOf(1);

              expectOneMatching(beacons, beacon => {
                cexpect(beacon['l']).to.equal(getE2ETestBaseUrl('05_fetch/fetchWithFormData'));
                cexpect(beacon['ty']).to.equal('xhr');
                cexpect(beacon['m']).to.equal('POST');
                cexpect(beacon['u']).to.match(/^http:\/\/127\.0\.0\.1:8000\/form+$/);
              });

              const ajaxRequest = expectOneMatching(ajaxRequests, ajaxRequest => {
                cexpect(ajaxRequest.url).to.match(/^\/form+$/);
                cexpect(ajaxRequest.headers['content-type']).to.contains('multipart/form-data;');
                cexpect(ajaxRequest.fields['name']).to.contains('somename');
                cexpect(ajaxRequest.fields['data']).to.contains('somedata');
              });

              cexpect(result).to.equal(ajaxRequest.response);

            });
        })
      );
    });
  });

  describe('05_fetchWithRequestObjectAndFormData', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('05_fetch/fetchWithRequestObjectAndFormData'));
    });

    it('must send form data in fetch requests', () => {
      return whenFetchIsSupported(() =>
        retry(() => {
          return Promise.all([getBeacons(), getAjaxRequests(), getResultElementContent(), getCapabilities()])
            .then(([beacons, ajaxRequests, result, capabilities]) => {
              cexpect(beacons).to.have.lengthOf(2);
              cexpect(ajaxRequests).to.have.lengthOf(1);

              expectOneMatching(beacons, beacon => {
                cexpect(beacon['l']).to.equal(getE2ETestBaseUrl('05_fetch/fetchWithRequestObjectAndFormData'));
                cexpect(beacon['ty']).to.equal('xhr');
                cexpect(beacon['m']).to.equal('POST');
                cexpect(beacon['u']).to.match(/^http:\/\/127\.0\.0\.1:8000\/form+$/);
              });

              const ajaxRequest = expectOneMatching(ajaxRequests, ajaxRequest => {
                cexpect(ajaxRequest.url).to.match(/^\/form+$/);
                cexpect(ajaxRequest.headers['content-type']).to.contains('multipart/form-data;');
                cexpect(ajaxRequest.fields['name']).to.contains('somename');
                cexpect(ajaxRequest.fields['data']).to.contains('somedata');
              });

              cexpect(result).to.equal(ajaxRequest.response);
            });
        })
      );
    });
  });

  describe('05_fetchWithCsrfToken', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('05_fetch/fetchWithCsrfToken'));
    });

    it('must send csrf token in fetch requests', () => {
      return whenFetchIsSupported(() =>
        retry(() => {
          return Promise.all([getBeacons(), getAjaxRequests(), getResultElementContent(), getCapabilities()])
            .then(([beacons, ajaxRequests, result, capabilities]) => {
              cexpect(beacons).to.have.lengthOf(7);
              cexpect(ajaxRequests).to.have.lengthOf(6);

              const ajaxGetBeacon = expectOneMatching(beacons, beacon => {
                cexpect(beacon['l']).to.equal(getE2ETestBaseUrl('05_fetch/fetchWithCsrfToken'));
                cexpect(beacon['ty']).to.equal('xhr');
                cexpect(beacon['m']).to.equal('GET');
                cexpect(beacon['u']).to.match(/^http:\/\/127\.0\.0\.1:8000\/ajax+$/);
                cexpect(beacon['h_test-header']).to.equal('a');
              });

              const ajaxGetRequest = expectOneMatching(ajaxRequests, ajaxRequest => {
                cexpect(ajaxRequest.url).to.match(/^\/ajax+$/);
                cexpect(ajaxRequest.method).to.equal('GET');
                //original header is passed through
                cexpect(ajaxRequest.headers['test-header']).to.equal('a');
              });

              const ajaxPostRequest = expectOneMatching(ajaxRequests, ajaxRequest => {
                cexpect(ajaxRequest.url).to.match(/^\/ajax+$/);
                cexpect(ajaxRequest.method).to.equal('POST');
                cexpect(ajaxRequest.headers['x-csrf-token']).to.equal('this-is-a-csrf-token');
                //original header is untouched.
                cexpect(ajaxRequest.headers['test-header']).to.equal('a');
              });

              cexpect(ajaxGetRequest.headers['x-instana-t']).to.equal(ajaxGetBeacon.t);
              //instana correltion header is not attached to original headers.
              cexpect(ajaxPostRequest.headers['x-instana-t']).to.not.contains(ajaxGetBeacon.t);

              const ajaxGetBeacon2 = expectOneMatching(beacons, beacon => {
                cexpect(beacon['l']).to.equal(getE2ETestBaseUrl('05_fetch/fetchWithCsrfToken'));
                cexpect(beacon['ty']).to.equal('xhr');
                cexpect(beacon['m']).to.equal('GET');
                cexpect(beacon['u']).to.match(/^http:\/\/127\.0\.0\.1:8000\/ajax+$/);
                cexpect(beacon['h_test-header']).to.equal('b');
              });

              const ajaxGetRequest2 = expectOneMatching(ajaxRequests, ajaxRequest => {
                cexpect(ajaxRequest.method).to.equal('GET');
                //original header is passed through
                cexpect(ajaxRequest.headers['test-header']).to.equal('b');
              });

              const ajaxPostRequest2 = expectOneMatching(ajaxRequests, ajaxRequest => {
                cexpect(ajaxRequest.method).to.equal('POST');
                cexpect(ajaxRequest.headers['x-csrf-token']).to.equal('this-is-a-csrf-token');
                //original header is untouched.
                cexpect(ajaxRequest.headers['test-header']).to.equal('b');
              });

              cexpect(ajaxGetRequest2.headers['x-instana-t']).to.equal(ajaxGetBeacon2.t);
              //instana correltion header is not attached to original headers.
              cexpect(ajaxPostRequest2.headers['x-instana-t']).to.not.contains(ajaxGetBeacon2.t);

              const ajaxGetBeacon3 = expectOneMatching(beacons, beacon => {
                cexpect(beacon['l']).to.equal(getE2ETestBaseUrl('05_fetch/fetchWithCsrfToken'));
                cexpect(beacon['ty']).to.equal('xhr');
                cexpect(beacon['m']).to.equal('GET');
                cexpect(beacon['u']).to.match(/^http:\/\/127\.0\.0\.1:8000\/ajax+$/);
                cexpect(beacon['h_test-header']).to.equal('c');
              });

              const ajaxGetRequest3 = expectOneMatching(ajaxRequests, ajaxRequest => {
                cexpect(ajaxRequest.method).to.equal('GET');
                //original header is passed through
                cexpect(ajaxRequest.headers['test-header']).to.equal('c');
              });

              const ajaxPostRequest3 = expectOneMatching(ajaxRequests, ajaxRequest => {
                cexpect(ajaxRequest.method).to.equal('POST');
                cexpect(ajaxRequest.headers['x-csrf-token']).to.equal('this-is-a-csrf-token');
                //original header is untouched.
                cexpect(ajaxRequest.headers['test-header']).to.equal('c');
              });

              cexpect(ajaxGetRequest3.headers['x-instana-t']).to.equal(ajaxGetBeacon3.t);
              //instana correltion header is not attached to original headers.
              cexpect(ajaxPostRequest3.headers['x-instana-t']).to.not.contains(ajaxGetBeacon3.t);

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
