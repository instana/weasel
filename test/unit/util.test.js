import {generateUniqueId, redactSecret} from '../../lib/util';

describe('util', () => {
  describe('generateUniqueId', () => {
    it('must stick to the zipkin trace id contract', () => {
      for (let i = 0; i < 500; i++) {
        expect(generateUniqueId()).toMatch(/^[0-9a-f]{1,16}$/i);
      }
    });
  });

  describe('redactSecret', () => {
    let regexp = [/account/i, /pass/i];
    let url = 'http://abc.com/search?accountno=user01&pass=password&phoneno=999';
    let url_redacted = 'http://abc.com/search?accountno=<redacted>&pass=<redacted>&phoneno=999';
    it('must strip secret from url', () => {
      expect(redactSecret(regexp, url)).toEqual(url_redacted);
    });
  });
});
