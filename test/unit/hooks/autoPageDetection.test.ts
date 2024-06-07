import {expect} from 'chai';

import {win} from '@lib/browser';
import defaultVars from '@lib/vars';
import type {Beacon} from '@lib/types';
import {stripSecrets} from '@lib/stripSecrets';
import {addCommonBeaconProperties} from '@lib/commonBeaconProperties';
import {initAutoPageDetection, isAutoPageDetectionEnabled} from '@lib/hooks/autoPageDetection';

describe('autodetection of page transition', () => {

  describe('check if page detection in enabled or not', () => {

    it('autoPageDetection must be  disabled if vars.autoPageDetection is false  ', () => {
      defaultVars.autoPageDetection = false;
      const beacon: Partial<Beacon> = {};
      const result: boolean = isAutoPageDetectionEnabled();
      addCommonBeaconProperties(beacon);
      expect(result).equal(false);
      expect(beacon.uf).not.exist;
    });

    it(' autoPageDetection is enabled while vars.autoPageDetection is true ', () => {
      defaultVars.autoPageDetection = true;
      const result: boolean = isAutoPageDetectionEnabled();
      expect(result).equal(true);
      const beacon: Partial<Beacon> = {};
      addCommonBeaconProperties(beacon);
      expect(beacon.uf).to.equal('sn');
    });

    it('autoPageDetection is enabled when an object is passed ', () => {
      defaultVars.autoPageDetection = {
        mappingRule: [[/.*information.*/, 'Contact for more information']],
        titleAsPageName: true
      };
      const result: boolean = isAutoPageDetectionEnabled();
      expect(result).equal(true);
      const beacon: Partial<Beacon> = {};
      addCommonBeaconProperties(beacon);
      expect(beacon.uf).equal('sn');
    });
  });
  describe('listen to various event listeners for page transition', () => {

    it('must  listen to hashchange event and set page ', () => {
      defaultVars.autoPageDetection = true;
      initAutoPageDetection();

      const event = new win.HashChangeEvent('hashchange', {
        oldURL: 'http://localhost/oldhashurl',
        newURL: 'http://localhost/newHashChangeUrl'
      });

      win.dispatchEvent(event);
      const beacon: Partial<Beacon> = {};
      addCommonBeaconProperties(beacon);
      expect(beacon.p).equal('/newHashChangeUrl');
    });

    it('must check for secretstrip when hashchange event occurs', () => {
      defaultVars.autoPageDetection = {mappingRule: [[/.*section*/, 'Section 1']], titleAsPageName: true};
      defaultVars.secrets = [/accountno/i];
      initAutoPageDetection();
      const urlRedacted = 'http://localhost/section?accountno=<redacted>';

      const event = new window.HashChangeEvent('hashchange', {
        oldURL: 'http://localhost/check',
        newURL: 'http://localhost/section?accountno=user02'
      });

      window.dispatchEvent(event);
      const beacon: Partial<Beacon> = {};
      addCommonBeaconProperties(beacon);
      expect(beacon.p).equal('Section 1?accountno=user02');
      expect(stripSecrets('http://localhost/section?accountno=user02')).equal(urlRedacted);
    });

    it('must listen to popstate event', () => {
      const state = {page: 2};
      const title = '';
      const url = 'http://localhost/page2PopStateEventOccured';
      win.history.pushState(state, title, url);
      const event = new window.PopStateEvent('popstate', {state});
      win.dispatchEvent(event);
      const beacon: Partial<Beacon> = {};
      addCommonBeaconProperties(beacon);
      expect(beacon.p).equal('/page2PopStateEventOccured');
    });
  });
  describe('must set page when the history apis are overridden', () => {

    it('must set page for pushstate history api', () => {
      const state = {page: 3};
      const title = 'page3';
      const url = 'http://localhost/page3PushStateApi';
      win.history.pushState(state, title, url);
      const beacon: Partial<Beacon> = {};
      addCommonBeaconProperties(beacon);
      expect(beacon.p).equal('/page3PushStateApi');
    });

    it('must  set page for  replace state api', () => {
      const state = {page: 4};
      const title = '';
      const url = 'http://localhost/page4ReplaceStateApi';
      win.history.replaceState(state, title, url);
      const beacon: Partial<Beacon> = {};
      addCommonBeaconProperties(beacon);
      expect(beacon.p).equal('/page4ReplaceStateApi');
    });
  });
  describe('check various mapping rules', () => {

    it('must return the page name according to the user wanted', () => {
      defaultVars.autoPageDetection = {mappingRule: [[/.*UserDetailsPage.*/, 'About User']], titleAsPageName: true};
      const state = {page: 5};
      const title = '';
      const url = 'http://localhost/UserDetailsPage';
      win.history.pushState(state, title, url);
      const beacon: Partial<Beacon> = {};
      addCommonBeaconProperties(beacon);
      expect(beacon.p).equal('About User');
    });

    it('must  match the pattern and return the string user provided  including digit', () => {
      defaultVars.autoPageDetection = {mappingRule: [[/.*testMappingRules\d.*/, 'About Mapping']]};
      const state = {page: 6};
      const title = '';
      const url = 'http://localhost/testMappingRules9';
      window.history.pushState(state, title, url);
      const beacon: Partial<Beacon> = {};
      addCommonBeaconProperties(beacon);
      expect(beacon.p).equal('About Mapping');
    });

    it('must  match the pattern and return the string user provided  without case sensitive', () => {
      defaultVars.autoPageDetection = {mappingRule: [[/.*testMappingrules.*/i, 'map case sensitive']]};
      const state = {page: 7};
      const title = '';
      const url = 'http://localhost/-mapping#howtotestMappingRulespartnow9';
      window.history.pushState(state, title, url);
      const beacon: Partial<Beacon> = {};
      addCommonBeaconProperties(beacon);
      expect(beacon.p).equal('map case sensitive');
    });

    it('must return the pathname given if array is empty', () => {
      defaultVars.autoPageDetection = {mappingRule: undefined};
      const state = {page: 8};
      const title = '';
      const url = 'http://localhost/-mapping#checkemptyarray';
      window.history.pushState(state, title, url);
      const beacon: Partial<Beacon> = {};
      addCommonBeaconProperties(beacon);
      expect(beacon.p).equal('/-mapping#checkemptyarray');
    });

    it('must capture group in regex', () => {
      defaultVars.autoPageDetection = {
        mappingRule: [
          [/^.*?-(about.*?)-(about.*?)-(about.*?)$/, 'app <redacted> about Route - Greeting: $1, Name: $2, 3rd $3']
        ],
        titleAsPageName: undefined
      };
      const state = {page: 9};
      const title = '';
      const url = 'http://localhost/#aboutNotGetMatched-about1Some-about2Where-about3SVL';
      window.history.pushState(state, title, url);
      const beacon: Partial<Beacon> = {};
      addCommonBeaconProperties(beacon);
      console.log('check the regex pattern ', beacon);
      expect(beacon.p).equal('app <redacted> about Route - Greeting: about1Some, Name: about2Where, 3rd about3SVL');
    });

    it('try complex regex capturing group', () => {
      defaultVars.autoPageDetection = {
        mappingRule: [
          [
            /.*checkregex\d\d\*[A-Za-z]+\.-functions12[A-Za-z]+-match\.[A-Za-z]+\?matchId=[A-Za-z0-9]+/,
            'checkregex?matchId=<redacted>'
          ]
        ],
        titleAsPageName: undefined
      };
      const state = {page: 10};
      const title = '';
      const url = 'http://localhost/checkregex12*benifits.-functions12replace-match.textpattern?matchId=6847664458';
      window.history.pushState(state, title, url);
      const beacon: Partial<Beacon> = {};
      addCommonBeaconProperties(beacon);
      expect(beacon.p).equal('checkregex?matchId=<redacted>');
    });

    it('try referencing in regex', () => {
      defaultVars.autoPageDetection = {
        mappingRule: [
          [/.*theurl[0-9]+contains-[A-Za-z]+-pathname,-queryparameterand-([A-Za-z].*)\1+/, 'SPA website uses $1']
        ],
        titleAsPageName: undefined
      };
      const state = {page: 8};
      const title = '';
      const url = 'http://localhost/theurl678contains-hostname-pathname,-queryparameterand-fragmentfragment';
      window.history.pushState(state, title, url);
      const beacon: Partial<Beacon> = {};
      addCommonBeaconProperties(beacon);
      expect(beacon.p).equal('SPA website uses fragment');
    });

    it('check the behaviour if a uri is passed', () => {
      defaultVars.autoPageDetection = true;
      const state = {page: 10};
      const title = '';
      const url = 'checkURIInsteadFullUrl'.repeat(3);
      window.history.pushState(state, title, url);
      const beacon: Partial<Beacon> = {};
      addCommonBeaconProperties(beacon);
      expect(beacon.p).equal('/checkURIInsteadFullUrlcheckURIInsteadFullUrlcheckURIInsteadFullUrl');
    });
  });
});
