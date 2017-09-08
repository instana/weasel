import {expect} from 'chai';

import {isUrlIgnored} from '../../lib/ignoreUrls';
import vars from '../../lib/vars';

describe('ignoreUrls', () => {
  afterEach(() => {
    vars.ignoreUrls = [];
    vars.ignorePings = true;
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

  it('must ignore pings by default', () => {
    expect(isUrlIgnored('http://example.com/ping')).to.equal(true);
    expect(isUrlIgnored('http://example.com/ping/')).to.equal(true);
    expect(isUrlIgnored('http://example.com/dsadsadad/ping/')).to.equal(true);
    expect(isUrlIgnored('http://ping.com/shop')).to.equal(false);
    expect(isUrlIgnored('http://example.com/ping/example')).to.equal(false);
    expect(isUrlIgnored('http://example.com/pingalistic')).to.equal(false);
  });

  it('must allow pings when the user knows what they are doing', () => {
    vars.ignorePings = false;

    expect(isUrlIgnored('http://example.com/ping')).to.equal(false);
    expect(isUrlIgnored('http://example.com/ping/')).to.equal(false);
    expect(isUrlIgnored('http://example.com/dsadsadad/ping/')).to.equal(false);
    expect(isUrlIgnored('http://ping.com/shop')).to.equal(false);
  });
});
