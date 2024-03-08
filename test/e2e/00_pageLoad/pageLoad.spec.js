const {registerTestServerHooks, getE2ETestBaseUrl, getBeacons} = require('../../server/controls');
const {registerBaseHooks, getCapabilities, hasResourceTimingSupport} = require('../base');
const util = require('../../util');

const cexpect = require('chai').expect;

describe('pageLoad', () => {
  registerTestServerHooks();
  registerBaseHooks();

  let start;

  beforeEach(() => {
    start = Date.now();
  });

  describe('pageLoad', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('00_pageLoad/pageLoad'));
    });

    it('must include basic page load information', async () => {
      const capabilities = await getCapabilities();
      return util.retry(async () => {
        const [beacon] = await getBeacons();
        cexpect(beacon.t).to.match(/[0-9a-f]{1,16}/i);

        // We cannot compare with start time due to saucelabs platforms not having
        // NTP properly configured…
        cexpect(beacon.r.length).to.be.at.least(String(start).length);
        cexpect(beacon.ts.length).to.be.below(6);
        cexpect(beacon.d.length).to.be.below(6);
        cexpect(beacon.ty).to.equal('pl');
        cexpect(beacon.k).to.equal(undefined);
        cexpect(beacon.p).to.equal(undefined);
        cexpect(beacon.u).to.equal(getE2ETestBaseUrl('00_pageLoad/pageLoad'));
        cexpect(beacon.ph).to.equal('pl');
        cexpect(beacon.sv).to.equal('2');

        // IE 8 doesn't support innerWidth and innerHeight
        if (capabilities.browserName !== 'internet explorer') {
          cexpect(beacon.ww).to.match(/^\d+$/);
          cexpect(beacon.wh).to.match(/^\d+$/);
        }

        if (capabilities.browserName === 'chrome') {
          cexpect(beacon.ul).to.be.a('string');
          cexpect(beacon.ul.split(',').length).to.be.at.least(1);
        }
      });
    });
  });

  describe('meta', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('00_pageLoad/meta'));
    });

    it('must send simple meta data information', () => {
      return util.retry(() => {
        return getBeacons()
          .then(beacons => {
            cexpect(beacons.length).to.equal(1);

            const [beacon] = beacons;
            cexpect(beacon['m_foo']).to.equal('bar');
            cexpect(beacon['m_a']).to.equal('true');
            cexpect(beacon['m_b']).to.equal('false');
            cexpect(beacon['m_c']).to.equal('42');
            cexpect(beacon['m_d'].startsWith('42.')).to.equal(true);
            cexpect(beacon['m_e']).to.equal('null');
            cexpect(beacon['m_f']).to.equal('undefined');
            cexpect(beacon['m_g']).to.equal('[1,2,3]');
            cexpect(beacon['m_h']).to.equal('{"a":true,"b":"42"}');
            cexpect(beacon['m_circularMeta']).to.equal(undefined);
            cexpect(beacon['ui']).to.equal('321');
            cexpect(beacon['un']).to.equal('Tom Anderson');
            cexpect(beacon['ue']).to.equal('tom.anderson@example.com');
            cexpect(beacon['sid']).to.be.a('string');
          });
      });
    });
  });

  describe('tooMuchMeta', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('00_pageLoad/tooMuchMeta'));
    });

    it('must restrict the number of meta data entries', () => {
      return util.retry(() => {
        return getBeacons()
          .then(beacons => {
            cexpect(beacons.length).to.equal(1);

            const [beacon] = beacons;

            cexpect(Object
              .keys(beacon)
              .filter(k => k.startsWith('m_'))
              .length).to.equal(25);
            cexpect(beacon['m_longValue']).to.match(/^a{1024,1024}$/);
          });
      });
    });
  });

  describe('customPage', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('00_pageLoad/customPage'));
    });

    it('must send user configured page', () => {
      return util.retry(() => {
        return getBeacons()
          .then(([beacon]) => {
            cexpect(beacon['p']).to.equal('myPage');
          });
      });
    });
  });

  describe('multiComplicatedMeta', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('00_pageLoad/multiComplicatedMeta'));
    });

    it('must send complicated meta data information', () => {
      return util.retry(() => {
        return getBeacons()
          .then(([beacon]) => {
            cexpect(beacon['m_user']).to.equal('tom.mason@example.com');
            cexpect(beacon['m_No&way']).to.equal('Ifyou\nHaveTo&DoThis');
          });
      });
    });
  });

  describe('apiKey', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('00_pageLoad/apiKey'));
    });

    it('must send user provided API key', () => {
      return util.retry(() => {
        return getBeacons()
          .then(([beacon]) => cexpect(beacon.k).to.equal('myFancyApiKey'));
      });
    });
  });

  describe('apiKeyViaKey', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('00_pageLoad/apiKeyViaKey'));
    });

    it('must send user provided API key', () => {
      return util.retry(() => {
        return getBeacons()
          .then(([beacon]) => cexpect(beacon.k).to.equal('myFancyApiKey'));
      });
    });
  });

  describe('backendTraceId', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('00_pageLoad/backendTraceId'));
    });

    it('must send user provided backend trace ID', () => {
      return util.retry(() => {
        return getBeacons()
          .then(([beacon]) => cexpect(beacon.bt).to.equal('someBackendTraceId'));
      });
    });
  });

  describe('ignoredWindowLocation', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('00_pageLoad/ignoredWindowLocation'));
    });

    it('must not send any data', async () => {
      await sleep(3000); // for lack of a better mechanism
      await util.retry(async () => {
        const beacons = await getBeacons();
        cexpect(beacons.length).to.equal(0);
      });
    });
  });

  describe('navigationTimings', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('00_pageLoad/navigationTimings'));
    });

    it('must send navigation timings', () => {
      return getCapabilities().then(capabilities => {
        if (!hasNavigationTimingSupport(capabilities)) {
          return true;
        }

        return util.retry(() => {
          return getBeacons()
            .then(([beacon]) => {
              testIsPositiveInteger(beacon.t_unl);
              testIsPositiveInteger(beacon.t_red);
              testIsPositiveInteger(beacon.t_apc);
              testIsPositiveInteger(beacon.t_dns);
              testIsPositiveInteger(beacon.t_tcp);
              testIsPositiveInteger(beacon.t_req);
              testIsPositiveInteger(beacon.t_rsp);
              testIsPositiveInteger(beacon.t_dom);
              testIsPositiveInteger(beacon.t_chi);
              testIsPositiveInteger(beacon.t_ttfb);
            });
        });
      });
    });

    it('must send either no first paint time or a time > 0', () => {
      return getCapabilities().then(capabilities => {
        if (!hasNavigationTimingSupport(capabilities)) {
          return true;
        }

        return util.retry(() => {
          return getBeacons()
            .then(([beacon]) => {
              // ensure that we have a beacon with some data
              testIsPositiveInteger(beacon.t_dom);

              if (beacon.t_fp !== undefined) {
                testIsPositiveInteger(beacon.t_fp, 1);
              }
            });
        });
      });
    });

    function testIsPositiveInteger(s, minInclusive = 0) {
      cexpect(s).to.match(/^\d+$/);
      cexpect(parseInt(s, 10)).to.be.at.least(minInclusive);
    }

    function hasNavigationTimingSupport(capabilities) {
      const version = Number(capabilities.version);
      return capabilities.browserName !== 'internet explorer' || version >= 9;
    }
  });

  describe('resourceTimings', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('00_pageLoad/resourceTimings'));
    });

    it('must send resource timing data', () => {
      return getCapabilities().then(capabilities => {
        if (!hasResourceTimingSupport(capabilities)) {
          return true;
        }

        return util.retry(() => {
          return getBeacons()
            .then(([beacon]) => {
              const timings = typeof beacon.res === 'string' ? JSON.parse(beacon.res) : beacon.res;
              stripTimingValues(timings);
              cexpect(timings).to.deep.equal({
                http: {
                  's://': {
                    'maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap': {
                      '.min.css': [true],
                      '-theme.min.css': [true]
                    },
                    'cdnjs.cloudflare.com/ajax/libs/jquery/1.12.4/jquery.js': [true]
                  },
                  '://127.0.0.1:8000/': {
                    'e2e/initializer.js': [true],
                    'target/eum.min.js': [true]
                  }
                }
              }, `Got the following timing: ${JSON.stringify(timings, 0, 2)}.`);
            });
        });
      });
    });
  });

  describe('ignoredResources', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('00_pageLoad/ignoredResources'));
    });

    it('must send resource timing data', async() => {
      const capabilities = await getCapabilities();
      if (!hasResourceTimingSupport(capabilities)) {
        return;
      }

      await util.retry(async () => {
        const beacons = await getBeacons();
        const timings = typeof beacons[0].res === 'string' ? JSON.parse(beacons[0].res) : beacons[0].res;
        stripTimingValues(timings);
        cexpect(timings).to.deep.equal({
          http: {
            's://cdnjs.cloudflare.com/ajax/libs/jquery/1.12.4/jquery.js': [true],
            '://127.0.0.1:8000/': {
              'e2e/initializer.js': [true],
              'target/eum.min.js': [true]
            }
          }
        }, `Got the following timing: ${JSON.stringify(timings, 0, 2)}.`);
      });
    });
  });

  describe('stripSecrets', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('00_pageLoad/pageLoadStripSecrets') + '&account=myaccount&appsecret=password&phoneno=119');
    });

    it('must strip secret from url', () => {
      return util.retry(() => {
        return getBeacons()
          .then(([beacon]) => {
            cexpect(beacon['u']).to.equal(getE2ETestBaseUrl('00_pageLoad/pageLoadStripSecrets') + '&account=<redacted>&appsecret=<redacted>&phoneno=119');
            cexpect(beacon['l']).to.equal(beacon['u']);
          });
      });
    });
  });

  describe('stripSecretlastQueryParam', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('00_pageLoad/pageLoadStripSecrets') + '&phoneno=119&account=myaccount#fragmentinfo');
    });

    it('must strip secret from url when it is last query parameter', () => {
      return util.retry(() => {
        return getBeacons()
          .then(([beacon]) => {
            cexpect(beacon['u']).to.equal(getE2ETestBaseUrl('00_pageLoad/pageLoadStripSecrets') + '&phoneno=119&account=<redacted>#fragmentinfo');
            cexpect(beacon['l']).to.equal(beacon['u']);
          });
      });
    });
  });

  describe('redactFragment', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('00_pageLoad/pageLoadRedactFragment') + '&account=myaccount&appsecret=password&phoneno=119#fragmentstring');
    });

    it('must redact fragment from url', () => {
      return util.retry(() => {
        return getBeacons()
          .then(([beacon]) => {
            cexpect(beacon['u']).to.equal(getE2ETestBaseUrl('00_pageLoad/pageLoadRedactFragment') + '&account=myaccount&appsecret=<redacted>&phoneno=119#<redacted>');
            cexpect(beacon['l']).to.equal(beacon['u']);
          });
      });
    });
  });

  describe('redactFragmentLastQp', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('00_pageLoad/pageLoadRedactFragment') + '&account=myaccount&appsecret=password#fragmentstring');
    });

    it('must strip secret from url for last query parameter and redact fragment', () => {
      return util.retry(() => {
        return getBeacons()
          .then(([beacon]) => {
            cexpect(beacon['u']).to.equal(getE2ETestBaseUrl('00_pageLoad/pageLoadRedactFragment') + '&account=myaccount&appsecret=<redacted>#<redacted>');
            cexpect(beacon['l']).to.equal(beacon['u']);
          });
      });
    });
  });

  describe('resourceStripSecrets', () => {
    beforeEach(() => {
      browser.get(getE2ETestBaseUrl('00_pageLoad/resourceStripSecrets'));
    });

    it('must send resource timing data with secrets striped', () => {
      return getCapabilities().then(capabilities => {
        if (!hasResourceTimingSupport(capabilities)) {
          return true;
        }

        return util.retry(() => {
          return getBeacons().then(([beacon]) => {
            const timings = typeof beacon.res === 'string' ? JSON.parse(beacon.res) : beacon.res;
            stripTimingValues(timings);
            cexpect(timings.http).to.have.property( 's://fonts.googleapis.com/css?family=<redacted>' );
          });
        });
      });
    });
  });

});

function stripTimingValues(node) {
  if (node instanceof Array) {
    node.forEach((entry, i) => node[i] = true);
    return;
  }

  Object.keys(node).forEach(key => stripTimingValues(node[key]));
}

function sleep(millis) {
  return new Promise(resolve => setTimeout(resolve, millis));
}
