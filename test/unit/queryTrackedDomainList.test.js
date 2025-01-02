import {expect} from 'chai';

import {isUrlIgnored, isErrorMessageIgnored} from '../../lib/ignoreRules';
import {isQueryTracked, removeQueryAndFragmentFromUrl} from '../../lib/queryTrackedDomainList';
import vars from '../../lib/vars';
import { stripSecrets } from '@lib/stripSecrets';
import {normalizeUrl} from '@lib/hooks/normalizeUrl';

describe('queryTrackedDomainList api', () => {
  afterEach(() => {
    vars.queryTrackedDomainList = [];
    vars.reportingUrl = 'https://ingress.example.com';
    vars.reportingBackends = [{reportingUrl: 'https://ingress.example.com', key: 'key'}];
  });

  describe('isQueryTracked', () => {
    it('must return true if url is undefined', () => {
      expect(isQueryTracked(undefined)).to.equal(true);
    });

    it('must track entire url including parameters if queryTrackedDomainList is empty', () => {
      vars.queryTrackedDomainList = [];

      expect(isQueryTracked('http://example.com')).to.equal(true);
      expect(isQueryTracked('http://shop.example.com')).to.equal(true);
      expect(isQueryTracked('http://example.com/123/@!#$**(?sdajd=sadas')).to.equal(true);

    });

    it('must track entire url including parameters of url in queryTrackedDomainList', () => {
      vars.queryTrackedDomainList = [/example.com$/];

      expect(isQueryTracked('http://example.com')).to.equal(true);
      expect(isQueryTracked('http://shop.example.com')).to.equal(true);
      expect(isQueryTracked('http://example.com/123/@!#$**(?sdajd=sadas')).to.equal(false);
      expect(isQueryTracked('http://example.comm')).to.equal(false);
      expect(isQueryTracked('http://google.com')).to.equal(false);

    });

    it('must track entire url including parameters of all urls in queryTrackedDomainList', () => {
      vars.queryTrackedDomainList = [/example1.com/, /example2.com$/];

      expect(isQueryTracked('http://example1.com')).to.equal(true);
      expect(isQueryTracked('http://shop.example1.com')).to.equal(true);
      expect(isQueryTracked('http://example1.com/123/@!#$**(?sdajd=sadas')).to.equal(true);
      expect(isQueryTracked('http://example2.com')).to.equal(true);
      expect(isQueryTracked('http://example2.comm')).to.equal(false);
      expect(isQueryTracked('http://example2.com/123/@!#$**(?sdajd=sadas')).to.equal(false);
      expect(isQueryTracked('http://google.com')).to.equal(false);

    });

  });

  describe('removeQueryAndFragmentFromUrl', () => {
    it('should return an empty string if the input is undefined', () => {
      expect(removeQueryAndFragmentFromUrl(undefined)).to.equal('');
    });
    it('should track original url if no query parameter or fragment', () => {
      const url = 'https://example.com/path';

      expect(removeQueryAndFragmentFromUrl(url)).to.equal(url);
    });

    it('should exclude query parameter and fragment if present', () => {
      const url1 = 'https://example.com/path?abcd#123';
      const parsedurl1 = 'https://example.com/path';

      const url2 = 'http://something.com/123/@!#$**(?sdajd=sadas';
      const parsedurl2 = 'http://something.com/123/@!';

      const url3 = 'http://something.com/123/@!#$**(.jpg';
      const parsedurl3 = 'http://something.com/123/@!';

      expect(removeQueryAndFragmentFromUrl(url1)).to.equal(parsedurl1);
      expect(removeQueryAndFragmentFromUrl(url2)).to.equal(parsedurl2);
      expect(removeQueryAndFragmentFromUrl(url3)).to.equal(parsedurl3);
    });

    it('test queryTrackedDomainList with redact query set should be tracked as redacted', () => {
      vars.secrets = [/account/i, /pass/i];
      vars.queryTrackedDomainList = [/example.com/i];
      let url = 'http://example.com/search?accountno=user01&pass=password&phoneno=999';
      let redactedurl = 'http://example.com/search?accountno=<redacted>&pass=<redacted>&phoneno=999';

      expect(isQueryTracked(url)).to.equal(true);
      expect(stripSecrets(url)).to.equal(redactedurl);

      if (!isQueryTracked(redactedurl)) {
        redactedurl  = removeQueryAndFragmentFromUrl(url);
      }
      expect(redactedurl).to.equal(redactedurl);
    });

    it('test url not in queryTrackedDomainList with redact query set', () => {
      vars.secrets = [/account/i, /pass/i];
      vars.queryTrackedDomainList = [/something.com/i];
      let url = 'http://example.com/search?accountno=user01&pass=password&phoneno=999';
      let redactedurl = 'http://example.com/search?accountno=<redacted>&pass=<redacted>&phoneno=999';
      let parsedurl = 'http://example.com/search';

      expect(isQueryTracked(url)).to.equal(false);
      expect(stripSecrets(url)).to.equal(redactedurl);
      expect(removeQueryAndFragmentFromUrl(stripSecrets(url))).to.equal(parsedurl);
    });
  });
});




