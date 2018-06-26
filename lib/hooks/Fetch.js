// @flow

import {isWhitelistedOrigin} from '../whitelistedOrigins';
import {originalFetch, win} from '../browser';
import {now, generateUniqueId} from '../util';
import {addMetaDataToBeacon} from '../meta';
import {normalizeUrl} from './normalizeUrl';
import {isUrlIgnored} from '../ignoreUrls';
import {sendBeacon} from '../transmission';
import {getActiveTraceId} from '../fsm';
import type {XhrBeacon} from '../types';
import {debug, info} from '../debug';
import {isSameOrigin} from '../sop';
import vars from '../vars';

export function instrumentFetch() {
  if (!self.fetch) {
    if (DEBUG) {
      info('Browser does not support the Fetch API.');
    }
    return;
  }

  win.fetch = function(url, init) {
    if (isUrlIgnored(url)) {
      if (DEBUG) {
        debug(
          'Not generating XHR beacon for fetch call because it is to be ignored according to user configuration. URL: ' + url
        );
      }
      return originalFetch(url, init);
    }

    // $FlowFixMe: Some properties deliberately left our for js file size reasons.
    const beacon: XhrBeacon = {
      // general beacon data
      'r': vars.referenceTimestamp,

      // $FlowFixMe: Some properties deliberately left our for js file size reasons.
      'k': vars.apiKey,
      // 't': '',
      'ts': 0,
      'd': 0,

      // xhr beacon specific data
      'ty': 'xhr',
      // 's': '',
      'pl': vars.pageLoadTraceId,
      'l': win.location.href,
      'm': '',
      'u': '',
      'a': 1,
      'st': 0,
      'e': undefined
    };

    addMetaDataToBeacon(beacon);

    let traceId = getActiveTraceId();
    const spanId = generateUniqueId();
    const setBackendCorrelationHeaders = isSameOrigin(url) || isWhitelistedOrigin(url);
    if (!traceId) {
      traceId = spanId;
    }

    beacon['t'] = traceId;
    beacon['s'] = spanId;
    beacon['m'] = init && init.method ? init.method : 'GET';
    beacon['u'] = normalizeUrl(url);
    beacon['a'] = 1;
    beacon['bc'] = setBackendCorrelationHeaders ? 1 : 0;

    if (setBackendCorrelationHeaders) {
      if (!init) {
        init = { headers: {} };
      }
      if (!init.headers) {
        init.headers = {};
      }
      init.headers['X-INSTANA-T'] = traceId;
      init.headers['X-INSTANA-S'] = spanId;
      init.headers['X-INSTANA-L'] = '1';
    }

    function afterFetch(response) {
      beacon['st'] = response.status;
      // When accessing object properties as object['property'] instead of
      // object.property flow does not know the type and assumes string.
      // Arithmetic operations like addition are only allowed on numbers. OTOH,
      // we can not safely use beacon.property as the compilation/minification
      // step will rename the properties which results in JSON payloads with
      // wrong property keys.
      // $FlowFixMe: see above
      beacon['d'] = now() - (beacon['ts'] + vars.referenceTimestamp);
      sendBeacon(beacon);
    }

    return originalFetch(url, init).then(function(response) {
      afterFetch(response);
      return response;
    });
  };
}

