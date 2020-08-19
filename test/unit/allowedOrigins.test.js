import {expect} from 'chai';

import {isAllowedOrigin} from '../../lib/allowedOrigins';
import vars from '../../lib/vars';

describe('allowed origins', () => {
  afterEach(() => {
    vars.allowedOrigins = [];
  });

  it('must not allow origin when the allow list is empty', () => {
    expect(isAllowedOrigin('http://example.com')).to.equal(false);
  });

  it('must identify origins to allow', () => {
    vars.allowedOrigins = [/example.com$/];

    expect(isAllowedOrigin('http://example.com')).to.equal(true);
    expect(isAllowedOrigin('http://shop.example.com')).to.equal(true);
    expect(isAllowedOrigin('http://example.comm')).to.equal(false);
    expect(isAllowedOrigin('http://google.com')).to.equal(false);
  });
});
