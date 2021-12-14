import { expect } from 'chai';
import vars from '../../../lib/vars';

describe('captureXhrHeaders', ()=> {
  let captureHttpHeaders;

  beforeEach(() => {
    self.DEBUG = false;
    const XMLHttpRequest = require('../../../lib/hooks/XMLHttpRequest');
    captureHttpHeaders = XMLHttpRequest.captureHttpHeaders;
    global.DEBUG = false;
  });

  afterEach(() => {
    delete global.DEBUG;
  });

  it('must capture specified http headers', () => {
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

    vars.headersToCapture = [/content-type/i];
    let beacon = {};
    captureHttpHeaders(beacon, responseHeaderString);
    expect(beacon['h_content-type']).to.equal(expectedResponseHeaders['content-type']);

  });
});

