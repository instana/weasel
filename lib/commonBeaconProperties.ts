import type {Beacon, Meta, ReportingBackend} from './types';
import {stripSecrets} from './stripSecrets';
import {win, doc, nav} from './browser';
import {hasOwnProperty} from './util';
import {getActivePhase} from './fsm';
import {warn} from './debug';
import vars from './vars';

const maximumNumberOfMetaDataFields = 25;
const maximumLengthPerMetaDataField = 1024;

const languages = determineLanguages();

// Internal Meta data
const maximumNumberOfInternalMetaDataFields = 128;
const maximumLengthPerInternalMetaDataField = 1024;

export function addCommonBeaconProperties(beacon: Partial<Beacon>) {
  if (vars.reportingBackends && vars.reportingBackends.length > 0) {
    const reportingBackend: ReportingBackend = vars.reportingBackends[0];
    beacon['k'] = reportingBackend['key'];
  } else {
    beacon['k'] = vars.apiKey;
  }
  beacon['sv'] = vars.trackingSnippetVersion;
  beacon['r'] = vars.referenceTimestamp;
  beacon['p'] = vars.page;
  beacon['l'] = stripSecrets(win.location.href);
  beacon['pl'] = vars.pageLoadTraceId;
  beacon['ui'] = vars.userId;
  beacon['un'] = vars.userName;
  beacon['ue'] = vars.userEmail;
  beacon['ul'] = languages;
  beacon['ph'] = getActivePhase();
  beacon['sid'] = vars.sessionId;
  beacon['ww'] = win.innerWidth;
  beacon['wh'] = win.innerHeight;
  beacon['agv'] = vars.agentVersion;
  // Google Closure compiler is not yet aware of these globals. Make sure it doesn't
  // mangle them.
  const anyNav = nav as any;
  if (anyNav['connection'] && anyNav['connection']['effectiveType']) {
    beacon['ct'] = anyNav['connection']['effectiveType'];
  }

  if (doc.visibilityState) {
    beacon['h'] = doc.visibilityState === 'hidden' ? 1 : 0;
  }

  addMetaDataToBeacon(beacon, vars.meta);

  if (vars.autoPageDetection) {
    // uf field will be a comma separated string if more than one use features are supported
    beacon['uf'] = 'sn';
  }
}

function determineLanguages() {
  if (nav.languages && nav.languages.length > 0) {
    return nav.languages.slice(0, 5).join(',');
  }

  const anyNav = nav as any;
  if (typeof anyNav.userLanguage === 'string') {
    return [anyNav.userLanguage].join(',');
  }

  return undefined;
}

export function addMetaDataToBeacon(beacon: Partial<Beacon>, meta: Meta) {
  addMetaDataImpl(beacon, meta);
}

export function addInternalMetaDataToBeacon(beacon: Partial<Beacon>, meta: Meta) {
  const options = {
    keyPrefix: 'im_',
    maxFields: maximumNumberOfInternalMetaDataFields,
    maxLengthPerField: maximumLengthPerInternalMetaDataField,
    maxFieldsWarningMsg:
      'Maximum number of internal meta data fields exceeded. Not all internal meta data fields will be transmitted.'
  };
  addMetaDataImpl(beacon, meta, options);
}

function addMetaDataImpl(
  beacon: Partial<Beacon>,
  meta: Meta,
  options?: {keyPrefix?: string; maxFields?: number; maxLengthPerField?: number; maxFieldsWarningMsg?: string}
) {
  const keyPrefix = options?.keyPrefix || 'm_';
  const maxFields = options?.maxFields || maximumNumberOfMetaDataFields;
  const maxLength = options?.maxLengthPerField || maximumLengthPerMetaDataField;
  const maxFieldsWarningMsg =
    options?.maxFieldsWarningMsg ||
    'Maximum number of meta data fields exceeded. Not all meta data fields will be transmitted.';

  let i = 0;

  for (const key in meta) {
    if (hasOwnProperty(meta, key)) {
      i++;
      if (i > maxFields) {
        if (DEBUG) {
          warn(maxFieldsWarningMsg);
        }
        return;
      }

      let serializedValue: string | null = null;

      if (typeof meta[key] === 'string') {
        serializedValue = meta[key] as string;
      } else if (meta[key] === undefined) {
        serializedValue = 'undefined';
      } else if (meta[key] === null) {
        serializedValue = 'null';
      } else if (win.JSON) {
        try {
          serializedValue = win.JSON.stringify(meta[key]);
        } catch (e) {
          if (DEBUG) {
            warn(
              'JSON serialization of meta data',
              key,
              meta[key],
              'failed due to',
              e,
              '. This value will not be transmitted.'
            );
          }
          continue;
        }
      } else {
        serializedValue = String(meta[key]);
      }

      beacon[keyPrefix + key] = serializedValue.substring(0, maxLength);
    }
  }
}
