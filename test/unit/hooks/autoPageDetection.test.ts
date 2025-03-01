import {expect} from 'chai';

import {win} from '@lib/browser';
import defaultVars from '@lib/vars';
import vars from '@lib/vars';
import type {Beacon, AutoPageDetectionType} from '@lib/types';
import {stripSecrets} from '@lib/stripSecrets';
import {addCommonBeaconProperties} from '@lib/commonBeaconProperties';
import {configAutoPageDetection, isAutoPageDetectionEnabled} from '@lib/hooks/autoPageDetection';
import {ignorePopstateEvent, titleAsPageNameInAutoPageDetection, processAutoPageDetectionCommand} from '@lib/hooks/autoPageDetection';
import {isWrapped} from '@lib/utilWrap';

describe('autodetection of page transition', () => {

  describe('check if page detection in enabled or not', () => {

    it('autoPageDetection must be  disabled if vars.autoPageDetection is false  ', () => {
      defaultVars.autoPageDetection = false;
      const beacon: Partial<Beacon> = {};
      const result: boolean = isAutoPageDetectionEnabled();
      addCommonBeaconProperties(beacon);
      expect(result).equal(false);

      const titleResult: boolean = titleAsPageNameInAutoPageDetection();
      expect(titleResult).equal(false);

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

      const titleResult: boolean = titleAsPageNameInAutoPageDetection();
      expect(titleResult).equal(true);

      const beacon: Partial<Beacon> = {};
      addCommonBeaconProperties(beacon);
      expect(beacon.uf).equal('sn');
    });
  });

  describe('autoPageDetection command test', () => {
    it('autoPageDetection command parsing normal', () => {
      const cmd: any = {mappingRule: [[/.*section*/, 'Section 1']], ignorePopstateEvent: false, titleAsPageName: true};
      vars.autoPageDetection = processAutoPageDetectionCommand(cmd);
      expect(isAutoPageDetectionEnabled()).equal(true);
      expect(ignorePopstateEvent()).equal(false);
      expect(titleAsPageNameInAutoPageDetection()).equal(true);
      const resultAPD = vars.autoPageDetection as AutoPageDetectionType;
      expect(resultAPD.mappingRule?.length).equal(1);
    });

    it('autoPageDetection command parsing empty', () => {
      const cmd: any = {};
      vars.autoPageDetection = processAutoPageDetectionCommand(cmd);
      expect(isAutoPageDetectionEnabled()).equal(true);
      expect(ignorePopstateEvent()).equal(false);
      expect(titleAsPageNameInAutoPageDetection()).equal(false);
      const resultAPD = vars.autoPageDetection as AutoPageDetectionType;
      expect(typeof resultAPD).equal('object');
      expect(typeof resultAPD.mappingRule).equal('undefined');
    });

    it('autoPageDetection command parsing abnormal configs (negative)', () => {
      let cmd: any = 101; //number is unexpected
      vars.autoPageDetection = processAutoPageDetectionCommand(cmd);
      expect(isAutoPageDetectionEnabled()).equal(true);
      let resultAPD = vars.autoPageDetection as AutoPageDetectionType;
      expect(typeof resultAPD).equal('boolean');

      cmd = 0; //number 0 is unexpected, 0 is treated as false
      vars.autoPageDetection = processAutoPageDetectionCommand(cmd);
      expect(isAutoPageDetectionEnabled()).equal(false);

      cmd = 'abc'; //string is unexpected
      vars.autoPageDetection = processAutoPageDetectionCommand(cmd);
      expect(isAutoPageDetectionEnabled()).equal(true);
      resultAPD = vars.autoPageDetection as AutoPageDetectionType;
      expect(typeof resultAPD).equal('boolean');

      cmd = {titleAsPageName: 'abc'}; //string is unexpected for titleAsPageName
      vars.autoPageDetection = processAutoPageDetectionCommand(cmd);
      expect(isAutoPageDetectionEnabled()).equal(true);
      expect(titleAsPageNameInAutoPageDetection()).equal(true); //string is treated as true
      resultAPD = vars.autoPageDetection as AutoPageDetectionType;
      expect(typeof resultAPD).equal('object');
      expect(typeof resultAPD.titleAsPageName).equal('string');
    });
  });

  describe('listen to various event listeners for page transition', () => {

    it('must  listen to hashchange event and set page ', () => {
      defaultVars.autoPageDetection = true;
      configAutoPageDetection();

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
      configAutoPageDetection();
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

      const titleResult: boolean = titleAsPageNameInAutoPageDetection();
      expect(titleResult).equal(false);

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
        titleAsPageName: false
      };
      const state = {page: 10};
      const title = '';
      const url = 'http://localhost/checkregex12*benifits.-functions12replace-match.textpattern?matchId=6847664458';
      window.history.pushState(state, title, url);

      const titleResult: boolean = titleAsPageNameInAutoPageDetection();
      expect(titleResult).equal(false);

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

  describe('test autoPageDetection configuration', () => {
    it('must re-enter autoPageDetection configuration', () => {
      defaultVars.autoPageDetection = {ignorePopstateEvent: false};
      configAutoPageDetection();
      expect(isWrapped(win.history.replaceState)).equal(true);
      expect(isWrapped(win.history.pushState)).equal(true);

      defaultVars.autoPageDetection = false;
      configAutoPageDetection();
      expect(isWrapped(win.history.replaceState)).equal(false);
      expect(isWrapped(win.history.pushState)).equal(false);
    });
  });
});
