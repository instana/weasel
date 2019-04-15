// @flow

import {createExcessiveUsageIdentifier} from '../excessiveUsageIdentification';
import {addCommonBeaconProperties} from '../commonBeaconProperties';
import {isWhitelistedOrigin} from '../whitelistedOrigins';
import {sendBeacon} from '../transmission/index';
import {originalFetch, win} from '../browser';
import {now, generateUniqueId} from '../util';
import {normalizeUrl} from './normalizeUrl';
import {isUrlIgnored} from '../ignoreRules';
import type {XhrBeacon} from '../types';
import {debug, info} from '../debug';
import {isSameOrigin} from '../sop';
import vars from '../vars';

const isExcessiveUsage = createExcessiveUsageIdentifier({
  maxCalls: 512,
  maxCallsPerTenSeconds: 32
});

export function instrumentFetch() {
  if (!win.fetch || !win.Request) {
    if (DEBUG) {
      info('Browser does not support the Fetch API.');
    }
    return;
  }

  win.fetch = function(input, init) {
    const request = new Request(input, init);

    if (isExcessiveUsage()) {
      if (DEBUG) {
        info('Reached the maximum number of fetch calls to monitor.');
      }
      return originalFetch(request);
    }

    const url = request.url;

    if (isUrlIgnored(url)) {
      if (DEBUG) {
        debug(
          'Not generating XHR beacon for fetch call because it is to be ignored according to user configuration. URL: ' + url
        );
      }
      return originalFetch(request);
    }

    // $FlowFixMe: Some properties deliberately left our for js file size reasons.
    const beacon: XhrBeacon = {
      'ty': 'xhr',

      // 't': '',
      'ts': now() - vars.referenceTimestamp,
      'd': 0,

      // xhr beacon specific data
      // 's': '',
      'l': win.location.href,
      'm': '',
      'u': '',
      'a': 1,
      'st': 0,
      'e': undefined
    };

    addCommonBeaconProperties(beacon);

    const spanAndTraceId = generateUniqueId();
    const setBackendCorrelationHeaders = isSameOrigin(url) || isWhitelistedOrigin(url);

    beacon['t'] = spanAndTraceId;
    beacon['s'] = spanAndTraceId;
    beacon['m'] = request.method;
    beacon['u'] = normalizeUrl(url);
    beacon['a'] = 1;
    beacon['bc'] = setBackendCorrelationHeaders ? 1 : 0;

    if (setBackendCorrelationHeaders) {
      request.headers.append('X-INSTANA-T', spanAndTraceId);
      request.headers.append('X-INSTANA-S', spanAndTraceId);
      request.headers.append('X-INSTANA-L', '1');
    }

    return originalFetch(request)
      .then(function(response) {
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
        return response;
      })
      .catch(function(e) {
        // $FlowFixMe: see above
        beacon['d'] = now() - (beacon['ts'] + vars.referenceTimestamp);
        beacon['e'] = e.message;
        beacon['st'] = -103;
        sendBeacon(beacon);
        throw e;
      });
  };
}
