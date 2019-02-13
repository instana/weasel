import type {Beacon, Meta} from './types';
import {win, doc, nav} from './browser';
import {hasOwnProperty} from './util';
import {getActivePhase} from './fsm';
import {error} from './debug';
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
  beacon['ph'] = getActivePhase();
  beacon['ww'] = win.innerWidth;
  beacon['wh'] = win.innerHeight;

  if (doc.visibilityState) {
    beacon['h'] = doc.visibilityState === 'hidden' ? 1 : 0;
  }

  addMetaDataToBeacon(beacon, vars.meta);
}

function determineLanguages() {
  if (nav.languages && nav.languages.length > 0) {
    return nav.languages.slice(0, 5).join(',');
  }

  if (typeof nav.userLanguage === 'string') {
    return [nav.userLanguage].join(',');
  }

  return undefined;
}

export function addMetaDataToBeacon(beacon: Beacon, meta: Meta) {
  for (let key in meta) {
    if (hasOwnProperty(meta, key)) {
      let serializedValue = null;

      if (typeof meta[key] === 'string') {
        serializedValue = meta[key];
      } else if (meta[key] === undefined) {
        serializedValue = 'undefined';
      } else if (meta[key] === null) {
        serializedValue = 'null';
      } else if (win.JSON) {
        try {
          serializedValue = win.JSON.stringify(meta[key]);
        } catch (e) {
          if (DEBUG) {
            error('JSON serialization of meta data',
            key,
            meta[key],
            'failed due to',
            e,
            '. This value will not be reported to Instana.');
          }
          continue;
        }
      } else {
        serializedValue = String(meta[key]);
      }

      beacon['m_' + key] = serializedValue.substring(0, 1024);
    }
  }
}
