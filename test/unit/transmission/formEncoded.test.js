jest.mock('../../../lib/browser');
jest.mock('../../../lib/vars');

describe('transmission/formEncoded', () => {
  let browserMock;
  let varsMock;
  let sendBeacon;

  beforeEach(() => {
    browserMock = require('../../../lib/browser');
    browserMock.reset();
    sendBeacon = require('../../../lib/transmission/formEncoded').sendBeacon;
    varsMock = require('../../../lib/vars').default;
    varsMock.reportingUrl = 'http://eum.example.com';
    varsMock.reportingBackends = [{reportingUrl: 'http://eum.example.com', key: 'key'}];
  });

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

  it('must transmit small payloads via image request', () => {
    sendBeacon({
      page: 'cart',
      id: 42,
      m_featureFlags: JSON.stringify({developerMode: false})
    });
    assertMatchesSnapshot();
  });

  it('must transmit larger payloads via XHR request', () => {
    const beacon = {
      page: 'cart',
      id: 42,
      m_featureFlags: JSON.stringify({developerMode: false}),
      longKey: Array(2001).fill('a').join('')
    };

    sendBeacon(beacon);
    assertMatchesSnapshot();
  });

  function assertMatchesSnapshot() {
    expect({
      imageRequests: browserMock.imageRequests,
      xhrRequests: browserMock.xhrRequests
    }).toMatchSnapshot();
  }
});
