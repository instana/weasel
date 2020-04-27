import type {Beacon, Meta} from './types';
import {win, doc, nav} from './browser';
import {hasOwnProperty} from './util';
import {getActivePhase} from './fsm';
import {warn} from './debug';
import vars from './vars';

const maximumNumberOfMetaDataFields = 25;
const maximumLengthPerMetaDataField = 1024;

const languages = determineLanguages();

export function addCommonBeaconProperties(beacon: Beacon) {
  beacon['k'] = vars.apiKey;
  beacon['r'] = vars.referenceTimestamp;
  beacon['p'] = vars.page;
  beacon['l'] = win.location.href;
  beacon['pl'] = vars.pageLoadTraceId;
  beacon['ui'] = vars.userId;
  beacon['un'] = vars.userName;
  beacon['ue'] = vars.userEmail;
  beacon['ul'] = languages;
  beacon['ph'] = getActivePhase();
  beacon['sid'] = vars.sessionId;
  beacon['ww'] = win.innerWidth;
  beacon['wh'] = win.innerHeight;
  // Google Closure compiler is not yet aware of these globals. Make sure it doesn't
  // mangle them.
  if (nav['connection'] && nav['connection']['effectiveType']) {
    beacon['ct'] = nav['connection']['effectiveType'];
  }

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
  let i = 0;

  for (let key in meta) {
    if (hasOwnProperty(meta, key)) {
      i++;
      if (i > maximumNumberOfMetaDataFields) {
        if (DEBUG) {
          warn('Maximum number of meta data fields exceeded. Not all meta data fields will be transmitted.');
        }
        return;
      }

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
            warn('JSON serialization of meta data',
              key,
              meta[key],
              'failed due to',
              e,
              '. This value will not be transmitted.');
          }
          continue;
        }
      } else {
        serializedValue = String(meta[key]);
      }

      beacon['m_' + key] = serializedValue.substring(0, maximumLengthPerMetaDataField);
    }
  }
}
