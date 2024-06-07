import {expect} from 'chai';

import {normalizeUrl} from '@lib/hooks/normalizeUrl';

describe('normalizeUrl', () => {
  it('must remove hash part in normalized url', () => {
    expect(normalizeUrl('abc/def?a=2&b=2#section1/subsec')).to.equal('http://localhost/abc/def?a=2&b=2');
    expect(normalizeUrl('https://a.com/abc/def?a=2&b=2#section1/subsec')).to.equal('https://a.com/abc/def?a=2&b=2');
  });

  it('must normalize relative path', () => {
    expect(normalizeUrl('/abc/path1/path2/../../f/1.html')).to.equal('http://localhost/abc/f/1.html');
    expect(normalizeUrl('abc/path1/path2/../../f/1.html')).to.equal('http://localhost/abc/f/1.html');
    expect(normalizeUrl('path1/path2/../abc/def?a=2&b=2#section1/subsec')).to.equal(
      'http://localhost/path1/abc/def?a=2&b=2'
    );
  });

  it('must include hash part in normalized url', () => {
    expect(normalizeUrl('abc/def?a=2&b=2#section1/subsec', true)).to.equal(
      'http://localhost/abc/def?a=2&b=2#section1/subsec'
    );
  });

  it('must truncate long urls', () => {
    const longUrl = 'https://company.com' + '/very-long-url-pattern'.repeat(210);
    const normalizedUrl = normalizeUrl(longUrl);
    expect(normalizedUrl.length).to.equal(4096);
    expect(longUrl.length).to.equal('https://company.com'.length + '/very-long-url-pattern'.length * 210);
    expect(longUrl.startsWith(normalizedUrl)).to.equal(true);
  });
});
