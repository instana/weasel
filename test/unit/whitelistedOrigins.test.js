import {expect} from 'chai';

import {isWhitelistedOrigin} from '../../lib/whitelistedOrigins';
import vars from '../../lib/vars';

describe('whitelistedOrigins', () => {
  afterEach(() => {
    vars.whitelistedOrigins = [];
  });

  it('must not ignore URLs when the ignore list is empty', () => {
    expect(isWhitelistedOrigin('http://example.com')).to.equal(false);
  });

  it('must identify URLs to ignore', () => {
    vars.whitelistedOrigins = [/example.com$/];

    expect(isWhitelistedOrigin('http://example.com')).to.equal(true);
    expect(isWhitelistedOrigin('http://shop.example.com')).to.equal(true);
    expect(isWhitelistedOrigin('http://example.comm')).to.equal(false);
    expect(isWhitelistedOrigin('http://google.com')).to.equal(false);
  });
});
