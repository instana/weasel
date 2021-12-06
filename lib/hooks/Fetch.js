// @flow

import {createExcessiveUsageIdentifier} from '../excessiveUsageIdentification';
import type {ObserveResourcePerformanceResult} from '../performanceObserver';
import {addResourceTiming, addCorrelationHttpHeaders, captureHeaders} from './xhrHelpers';
import {addCommonBeaconProperties} from '../commonBeaconProperties';
import {observeResourcePerformance} from '../performanceObserver';
import {now, generateUniqueId, matchesAny} from '../util';
import {isAllowedOrigin} from '../allowedOrigins';
import {sendBeacon} from '../transmission/index';
import {stripSecrets} from '../stripSecrets';
import {originalFetch, win} from '../browser';
import {normalizeUrl} from './normalizeUrl';
import {isUrlIgnored} from '../ignoreRules';
import type {XhrBeacon} from '../types';
import {debug, info} from '../debug';
import {isSameOrigin} from '../sop';
import vars from '../vars';

const isExcessiveUsage = createExcessiveUsageIdentifier({
  maxCallsPerTenMinutes: 256,
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
      'm': '',
      'u': '',
      'a': 1,
      'st': 0,
      'e': undefined
    };

    addCommonBeaconProperties(beacon);
    addGraphQlProperties(beacon, input, init);

    const spanAndTraceId = generateUniqueId();
    const setBackendCorrelationHeaders = isSameOrigin(url) || isAllowedOrigin(url);

    beacon['t'] = spanAndTraceId;
    beacon['s'] = spanAndTraceId;
    beacon['m'] = request.method;
    beacon['u'] = stripSecrets(normalizeUrl(url));
    beacon['a'] = 1;
    beacon['bc'] = setBackendCorrelationHeaders ? 1 : 0;

    if (setBackendCorrelationHeaders) {
      addCorrelationHttpHeaders(request.headers.append, request.headers, spanAndTraceId);
    }

    captureHeaders(request.headers.forEach, request.headers, beacon);

    const performanceObserver = observeResourcePerformance({
      entryTypes: ['resource'],
      resourceMatcher,
      maxWaitForResourceMillis: vars.maxWaitForResourceTimingsMillis,
      onEnd
    });
    performanceObserver.onBeforeResourceRetrieval();

    return originalFetch(request)
      .then(function(response) {
        beacon['st'] = response.status;
        captureHeaders(response.headers.forEach, response.headers, beacon);
        // When accessing object properties as object['property'] instead of
        // object.property flow does not know the type and assumes string.
        // Arithmetic operations like addition are only allowed on numbers. OTOH,
        // we can not safely use beacon.property as the compilation/minification
        // step will rename the properties which results in JSON payloads with
        // wrong property keys.
        // $FlowFixMe: see above
        performanceObserver.onAfterResourceRetrieved();
        return response;
      }, function(e) {
        performanceObserver.cancel();
        // $FlowFixMe: see above
        beacon['d'] = now() - (beacon['ts'] + vars.referenceTimestamp);
        beacon['e'] = e.message;
        beacon['st'] = -103;
        sendBeacon(beacon);
        throw e;
      });

    function resourceMatcher(resource:  PerformanceResourceTiming): boolean {
      return (resource.initiatorType === 'fetch' || resource.initiatorType === 'xmlhttprequest') &&
        // $FlowFixMe We know that beacon['u'] is now set
        Boolean(resource.name) && resource.name.indexOf(beacon['u']) === 0;
    }

    function onEnd(args: ObserveResourcePerformanceResult) {
      beacon['d'] = args.duration;
      if (args.resource) {
        addResourceTiming(beacon, args.resource);
      }
      sendBeacon(beacon);
    }
  };
}

const queryIdentification = /^\s*query(\s|\{)/i;
const mutationIdentification = /^\s*mutation(\s|\{)/i;

function addGraphQlProperties(beacon: XhrBeacon, input, init) {
  try {
    if (typeof input !== 'string' ||
        !init ||
        init.method !== 'POST' ||
        typeof init.body !== 'string' ||
        !matchesAny(vars.urlsToCheckForGraphQlInsights, input)) {
      return;
    }

    const body = JSON.parse(init.body);

    if (typeof body['operationName'] === 'string') {
      beacon['gon'] = body['operationName'];
    }

    if (typeof body['query'] === 'string') {
      if (queryIdentification.test(body['query'])) {
        beacon['got'] = 'query';
      } else if (mutationIdentification.test(body['query'])) {
        beacon['got'] = 'mutation';
      } else if (body['query'].indexOf('{') === 0 && body['operationName'] === null) {
        beacon['got'] = 'query';
      }
    }
  } catch (e) {
    if (DEBUG) {
      debug('Failed to analyze request for GraphQL insights.', input, init);
    }
  }

}
