import {expect} from 'chai';

import {isUrlIgnored} from '../../lib/ignoreUrls';
import vars from '../../lib/vars';

describe('ignoreUrls', () => {
  afterEach(() => {
    vars.ignoreUrls = [];
  });

  it('must not ignore URLs when the ignore list is empty', () => {
    expect(isUrlIgnored('http://example.com')).to.equal(false);
  });

  it('must identify URLs to ignore', () => {
    vars.ignoreUrls = [/example.com$/];

    expect(isUrlIgnored('http://example.com')).to.equal(true);
    expect(isUrlIgnored('http://shop.example.com')).to.equal(true);
    expect(isUrlIgnored('http://example.comm')).to.equal(false);
    expect(isUrlIgnored('http://google.com')).to.equal(false);
  });
});
