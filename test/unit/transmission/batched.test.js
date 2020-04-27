jest.mock('../../../lib/browser');
jest.mock('../../../lib/vars');

jest.useFakeTimers();

const firstBeacon = {
  ty: 'pl',
  page: 'landing',
  ts: 123456789,
  error: false
};

const secondBeacon = {
  ty: 'xhr',
  page: 'cart',
  ts: 123456789,
  error: true
};

describe('transmission/batched', () => {
  let browserMock;
  let varsMock;
  let sendBeacon;

  beforeEach(() => {
    browserMock = require('../../../lib/browser');
    browserMock.reset();
    varsMock = require('../../../lib/vars').default;
    sendBeacon = require('../../../lib/transmission/batched').sendBeacon;
  });

  describe('with unsupported sendBeacon API', () => {
    tests();
  });

  describe('with sendBeacon API', () => {
    beforeEach(() => {
      jest.resetModules();

      browserMock = require('../../../lib/browser');
      browserMock.reset();
      // simulate availability of the sendBeacon API
      browserMock.nav.sendBeacon = () => {};
      varsMock = require('../../../lib/vars').default;

      sendBeacon = require('../../../lib/transmission/batched').sendBeacon;
    });

    afterEach(() => {
      delete browserMock.nav.sendBeacon;
    });

    tests();
  });

  function tests() {
    describe('without batching', () => {
      it('must do nothing when there is nothing to transmit', () => {
        sendBeacon({});
        assertMatchesSnapshot();
      });

      it('must only transmit own props', () => {
        const parentObject = {};
        parentObject.shouldNotBeIncluded = 'secr3t!';
        const beacon = Object.create(parentObject);
        beacon.page = 'cart';
        sendBeacon(beacon);
        assertMatchesSnapshot();
      });

      it('must transmit larger payloads', () => {
        const beacon = {
          page: 'cart',
          id: 42,
          m_featureFlags: JSON.stringify({developerMode: false}),
          longKey: Array(2001).fill('a').join('')
        };

        sendBeacon(beacon);
        assertMatchesSnapshot();
      });

      it('must transmit multiple beacons', () => {
        sendBeacon(firstBeacon);
        sendBeacon(secondBeacon);
        assertMatchesSnapshot();
      });
    });

    describe('with batching', () => {
      beforeEach(() => {
        varsMock.beaconBatchingTime = 100;
      });

      afterEach(() => {
        varsMock.beaconBatchingTime = 0;
      });

      it('must not attempt batching when window is hidden', () => {
        try {
          setVisibilityState('hidden');
          sendBeacon(firstBeacon);
          sendBeacon(secondBeacon);
          assertMatchesSnapshot();
        } finally {
          setVisibilityState('prerender');
        }
      });

      it('must batch when window is visible', () => {
        try {
          setVisibilityState('visible');
          sendBeacon(firstBeacon);
          sendBeacon(secondBeacon);
          jest.runOnlyPendingTimers();
          assertMatchesSnapshot();
        } finally {
          setVisibilityState('prerender');
        }
      });

      it('must send early when window becomes hidden', () => {
        try {
          setVisibilityState('visible');
          sendBeacon(firstBeacon);
          sendBeacon(secondBeacon);
          assertMatchesSnapshot();
          setVisibilityState('hidden');
          assertMatchesSnapshot();
        } finally {
          setVisibilityState('prerender');
        }
      });

      it('must send early when window is unloaded', () => {
        try {
          setVisibilityState('visible');
          sendBeacon(firstBeacon);
          sendBeacon(secondBeacon);
          assertMatchesSnapshot();
          browserMock.win.dispatchEvent(new Event('beforeunload'));
          assertMatchesSnapshot();
        } finally {
          setVisibilityState('prerender');
        }
      });

      it('must have an upper limit on the number of batched beacons', () => {
        try {
          setVisibilityState('visible');
          for (let i = 0; i < 15; i++) {
            sendBeacon(firstBeacon);
          }
          for (let i = 0; i < 5; i++) {
            sendBeacon(secondBeacon);
          }
          assertMatchesSnapshot();
          browserMock.win.dispatchEvent(new Event('beforeunload'));
          assertMatchesSnapshot();
        } finally {
          setVisibilityState('prerender');
        }
      });
    });
  }

  function assertMatchesSnapshot() {
    expect({
      imageRequests: browserMock.imageRequests,
      xhrRequests: browserMock.xhrRequests,
      beaconRequests: browserMock.beaconRequests
    }).toMatchSnapshot();
  }

  function setVisibilityState(state) {
    Object.defineProperty(browserMock.doc, 'visibilityState', {
      value: state,
      configurable: true
    });

    browserMock.doc.dispatchEvent(new Event('visibilitychange'));
  }
});
