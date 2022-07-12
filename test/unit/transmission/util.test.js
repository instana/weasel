import {isTransmitionRequest} from '../../../lib/transmission/util';

jest.mock('../../../lib/vars');

describe('transmission/util', () => {
  let varsMock;

  beforeEach(() => {
    varsMock = require('../../../lib/vars').default;
    varsMock.reportingUrl = 'http://eum1.example.com';
    varsMock.reportingBackends = [];
  });

  it('Check transmission request', () => {
    expect(isTransmitionRequest('http://eum1.example.com')).toBeTruthy();
    expect(isTransmitionRequest('http://eum1.example.com/')).toBeTruthy();
    expect(isTransmitionRequest('http://eum1.example.com/eum.min.js')).not.toBeTruthy();
    expect(isTransmitionRequest('http://eum2.example.com')).not.toBeTruthy();
    expect(isTransmitionRequest('http://eum2.example.com/')).not.toBeTruthy();
    expect(isTransmitionRequest('http://eum.example.com')).not.toBeTruthy();
  });

  it('Check transmission request with multiple backends', () => {
    varsMock.reportingBackends = [
      { reportingUrl: 'http://eum2.example.com', key: 'key' },
      { reportingUrl: 'http://eum3.example.com', key: 'key' }
    ];
    expect(isTransmitionRequest('http://eum1.example.com')).not.toBeTruthy();
    expect(isTransmitionRequest('http://eum1.example.com/')).not.toBeTruthy();
    expect(isTransmitionRequest('http://eum2.example.com')).toBeTruthy();
    expect(isTransmitionRequest('http://eum2.example.com/')).toBeTruthy();
    expect(isTransmitionRequest('http://eum2.example.com/eum.min.js')).not.toBeTruthy();
    expect(isTransmitionRequest('http://eum3.example.com')).toBeTruthy();
    expect(isTransmitionRequest('http://eum3.example.com/')).toBeTruthy();
    expect(isTransmitionRequest('http://eum3.example.com/eum.min.js')).not.toBeTruthy();
    expect(isTransmitionRequest('http://eum.example.com')).not.toBeTruthy();
  });

});
