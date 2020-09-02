import {expect} from 'chai';

import {isUrlIgnored, isErrorMessageIgnored} from '../../lib/ignoreRules';
import vars from '../../lib/vars';

describe('ignoreRules', () => {
  afterEach(() => {
    vars.ignoreUrls = [];
    vars.ignorePings = true;
    vars.ignoreErrorMessages = [];
    vars.reportingUrl = 'https://ingress.example.com';
  });

  describe('isUrlIgnored', () => {
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
      expect(isUrlIgnored('http://example.com/ping?foo=bar')).to.equal(true);
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
      expect(isUrlIgnored('http://example.com/ping?foo=bar')).to.equal(false);
    });

    it('must ignore data URLs by default', () => {
      expect(isUrlIgnored('data:text/html,%3Ch1%3EHello%2C%20World!%3C%2Fh1%3E')).to.equal(true);
    });

    it('must ignore data transmission requests', () => {
      expect(isUrlIgnored(vars.reportingUrl)).to.equal(true);
      expect(isUrlIgnored(vars.reportingUrl + '/')).to.equal(true);
      expect(isUrlIgnored(vars.reportingUrl + '/eum.min.js')).to.equal(false);
    });
  });

  describe('isErrorMessageIgnored', () => {
    it('must not ignore error messages when the ignore list is empty', () => {
      expect(isErrorMessageIgnored('Script error.')).to.equal(false);
      expect(isErrorMessageIgnored('Script error')).to.equal(false);
    });

    it('must respect ignore rules', () => {
      vars.ignoreErrorMessages = [/script error/i];
      expect(isErrorMessageIgnored('Foobar: Script error.')).to.equal(true);
      expect(isErrorMessageIgnored('Something: Script error')).to.equal(true);
      expect(isErrorMessageIgnored('Foobar')).to.equal(false);
    });
  });
});
