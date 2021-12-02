jest.mock('../../lib/vars');

describe('stripSecrets', () => {
  let varsMock;
  let stripSecrets;
  let url;
  let urlRedacted;

  beforeEach(() => {
    self.DEBUG = false;
    const stripSecretsMock = require('../../lib/stripSecrets');
    stripSecrets = stripSecretsMock.stripSecrets;
    varsMock = require('../../lib/vars').default;
    varsMock.secrets = [/account/i, /pass/i];
    global.DEBUG = false;
  });

  afterEach(() => {
    delete global.DEBUG;
  });

  it('strip secret from url with multiple query parameters', () => {
    url = 'http://example.com/search?accountno=user01&pass=password&phoneno=999';
    urlRedacted = 'http://example.com/search?accountno=<redacted>&pass=<redacted>&phoneno=999';
    expect(stripSecrets(url)).toEqual(urlRedacted);
  });

  it('strip secret from url with single query parameter', () => {
    url = 'http://example.com/search?accountno=user01';
    urlRedacted = 'http://example.com/search?accountno=<redacted>';
    expect(stripSecrets(url)).toEqual(urlRedacted);
    url = 'http://example.com/search?DATA=[{"T":"Info", "FID":"CI", "Name":"HasRR","Text":"1"}]';
    urlRedacted =
      'http://example.com/search?DATA=[{%22T%22:%22Info%22,%20%22FID%22:%22CI%22,%20%22Name%22:%22HasRR%22,%22Text%22:%221%22}]';
    expect(stripSecrets(url)).toEqual(urlRedacted);
  });

  it('strip secret from url with no query parameter', () => {
    url = 'http://example.com/search';
    expect(stripSecrets(url)).toEqual(url);
  });

  it('strip secret from invalid url', () => {
    expect(stripSecrets(null)).toEqual(null);
    url = 'invalid://example.com/search?phoneno=999';
    expect(stripSecrets(url)).toEqual(url);
  });
});
