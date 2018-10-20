import {addMetaDataToBeacon} from './meta';
import type {Beacon} from './types';
import {doc, nav} from './browser';
import vars from './vars';

const languages = determineLanguages();

export function addCommonBeaconProperties(beacon: Beacon) {
  beacon['k'] = vars.apiKey;
  beacon['r'] = vars.referenceTimestamp;
  beacon['p'] = vars.page;
  beacon['pl'] = vars.pageLoadTraceId;
  beacon['ui'] = vars.userId;
  beacon['un'] = vars.userName;
  beacon['ue'] = vars.userEmail;
  beacon['ul'] = languages;

  if (doc.visibilityState) {
    beacon['h'] = doc.visibilityState === 'hidden' ? 1 : 0;
  }

  addMetaDataToBeacon(beacon);
}

function determineLanguages() {
  if (nav.languages && nav.languages.length > 0) {
    return nav.languages.slice(0, 5).join(',');
  }

  if (typeof nav.userLanguage === 'string') {
    return [nav.userLanguage];
  }

  return undefined;
}
