import { captureXhrHeaders, convertHeader } from '../../../lib/hooks/xhrHelpers';

import { expect } from 'chai';
import vars from '../../../lib/vars';

describe('xhrHelpers', () => {
  describe('convertHeader', () => {
    it('must convert http response header string to map', () => {
      const responseHeaderString = 'date: Fri, 08 Dec 2017 21:04:30 GMT\r\n'
        + 'content-encoding: gzip\r\n'
        + 'x-content-type-options: nosniff\r\n'
        + 'server: meinheld/0.6.1\r\n'
        + 'x-frame-options: DENY\r\n'
        + 'content-type: text/html; charset=utf-8\r\n'
        + 'connection: keep-alive\r\n'
        + 'strict-transport-security: max-age=63072000\r\n'
        + 'vary: Cookie, Accept-Encoding\r\n'
        + 'content-length: 6502\r\n'
        + 'x-xss-protection: 1; mode=block\r\n';

      const expectedResponseHeaders = {
        'date': 'Fri, 08 Dec 2017 21:04:30 GMT',
        'content-encoding': 'gzip',
        'x-content-type-options': 'nosniff',
        'server': 'meinheld/0.6.1',
        'x-frame-options': 'DENY',
        'content-type': 'text/html; charset=utf-8',
        'connection': 'keep-alive',
        'strict-transport-security': 'max-age=63072000',
        'vary': 'Cookie, Accept-Encoding',
        'content-length': '6502',
        'x-xss-protection': '1; mode=block',
      };

      for( let key in expectedResponseHeaders ) {
        expect(convertHeader(responseHeaderString)[key]).to.equal(expectedResponseHeaders[key]);
      }

    });
  });

  describe('captureXhrHeaders', ()=> {
    it('must capture specified http headers', () => {
      const expectedCapturedHeaders = {
        'host': 'example.com'
      };

      const headers = {
        'content-type': 'application/json',
        'host': 'example.com'
      };

      vars.headersToCapture = [/host/i];
      let beacon = {};
      captureXhrHeaders(beacon, headers);
      expect(beacon['h_host']).to.equal(expectedCapturedHeaders['host']);

    });
  });
});
