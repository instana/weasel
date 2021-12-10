// @flow

import {createExcessiveUsageIdentifier} from '../excessiveUsageIdentification';
import type {ObserveResourcePerformanceResult} from '../performanceObserver';
import {addResourceTiming, addCorrelationHttpHeaders} from './xhrHelpers';
import {addCommonBeaconProperties} from '../commonBeaconProperties';
import {observeResourcePerformance} from '../performanceObserver';
import {isAllowedOrigin} from '../allowedOrigins';
import {sendBeacon} from '../transmission/index';
import {stripSecrets} from '../stripSecrets';
import {now, generateUniqueId, matchesAny} from '../util';
import {normalizeUrl} from './normalizeUrl';
import {isUrlIgnored} from '../ignoreRules';
import {debug, info, warn} from '../debug';
import {XMLHttpRequest} from '../browser';
import type {XhrBeacon} from '../types';
import {isSameOrigin} from '../sop';
import vars from '../vars';

const isExcessiveUsage = createExcessiveUsageIdentifier({
  maxCallsPerTenMinutes: 256,
  maxCallsPerTenSeconds: 32
});

// In addition to the common HTTP status codes, a bunch of
// additional outcomes are possible. Mainly errors, the following
// status codes denote internal codes which are used for beacons
// to describe the XHR result.
const additionalStatuses = {
  // https://xhr.spec.whatwg.org/#the-timeout-attribute
  timeout: -100,

  // Used when the request is aborted:
  // https://xhr.spec.whatwg.org/#the-abort()-method
  abort: -101,

  // Errors may occur when opening an XHR object for a variety of
  // reasons.
  // https://xhr.spec.whatwg.org/#the-open()-method
  openError: -102,

  // Non-HTTP errors, e.g. failed to establish connection.
  // https://xhr.spec.whatwg.org/#events
  error: -103
};

const traceIdHeaderRegEx = /^X-INSTANA-T$/i;

export function instrumentXMLHttpRequest() {
  if (!XMLHttpRequest ||
      !(new XMLHttpRequest()).addEventListener) {
    if (DEBUG) {
      info('Browser does not support the features required for XHR instrumentation.');
    }
    return;
  }

  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
  const originalSend = XMLHttpRequest.prototype.send;

  if (!originalOpen || !originalSetRequestHeader || !originalSend) {
    if (DEBUG) {
      warn('The XMLHttpRequest prototype is in an unsupported state due to some missing XMLHttpRequest.prototype ' +
        'properties. This is most likely caused by third-party libraries that are instrumenting/changing the ' +
        'XMLHttpRequest API in a specification incompliant way.');
    }
    return;
  }

  XMLHttpRequest.prototype.open = function open(method, url, async) {
    const xhr = this;

    if (isExcessiveUsage()) {
      if (DEBUG) {
        info('Reached the maximum number of XMLHttpRequests to monitor.');
      }

      return originalOpen.apply(xhr, arguments);
    }

    const state = xhr[vars.secretPropertyKey] = xhr[vars.secretPropertyKey] || {};
    // probably ignored due to disableMonitoringForXMLHttpRequest calls
    if (state.ignored) {
      return originalOpen.apply(xhr, arguments);
    }

    state.ignored = isUrlIgnored(url);
    if (state.ignored) {
      if (DEBUG) {
        debug(
          'Not generating XHR beacon because it should be ignored according to user configuration. URL: ' + url
        );
      }
      return originalOpen.apply(xhr, arguments);
    }

    state.spanAndTraceId = generateUniqueId();
    state.setBackendCorrelationHeaders = isSameOrigin(url) || isAllowedOrigin(url);

    // $FlowFixMe: Some properties deliberately left our for js file size reasons.
    const beacon: XhrBeacon = {
      'ty': 'xhr',

      // general beacon data
      't': state.spanAndTraceId,
      's': state.spanAndTraceId,
      'ts': 0,
      'd': 0,

      // xhr beacon specific data
      // 's': '',
      'm': method,
      'u': stripSecrets(normalizeUrl(url)),
      'a': async === undefined || async ? 1 : 0,
      'st': 0,
      'e': undefined,
      'bc': state.setBackendCorrelationHeaders ? 1 : 0
    };
    state.beacon = beacon;

    state.performanceObserver = observeResourcePerformance({
      entryTypes: ['resource'],
      resourceMatcher: function resourceMatcher(resource:  PerformanceResourceTiming): boolean {
        return (resource.initiatorType === 'fetch' || resource.initiatorType === 'xmlhttprequest') &&
          // $FlowFixMe We know that beacon['u'] is now set
          !!resource.name && resource.name.indexOf(beacon['u']) === 0;
      },
      maxWaitForResourceMillis: vars.maxWaitForResourceTimingsMillis,
      onEnd: function onEnd(args: ObserveResourcePerformanceResult) {
        beacon['d'] = args.duration;
        if (args.resource) {
          addResourceTiming(beacon, args.resource);
        }
        sendBeacon(beacon);
      }
    });

    try {
      const result = originalOpen.apply(xhr, arguments);
      xhr.addEventListener('timeout', onTimeout);
      xhr.addEventListener('error', onError);
      xhr.addEventListener('abort', onAbort);
      xhr.addEventListener('readystatechange', onReadystatechange);
      return result;
    } catch (e) {
      state.performanceObserver.cancel();
      beacon['ts'] = now() - vars.referenceTimestamp;
      beacon['st'] = additionalStatuses.openError;
      beacon['e'] = e.message;
      addCommonBeaconProperties(beacon);
      sendBeacon(beacon);
      xhr[vars.secretPropertyKey] = null;
      throw e;
    }

    function onFinish(status) {
      if (state.ignored) {
        return;
      }

      if (beacon['st'] !== 0) {
        // Multiple finish events. Should only happen when we setup the event handlers
        // in a wrong way or when the XHR object is reused. We don't support this use
        // case.
        return;
      }

      beacon['st'] = status;
      // When accessing object properties as object['property'] instead of
      // object.property flow does not know the type and assumes string.
      // Arithmetic operations like addition are only allowed on numbers. OTOH,
      // we can not safely use beacon.property as the compilation/minification
      // step will rename the properties which results in JSON payloads with
      // wrong property keys.
      // $FlowFixMe: see above
      beacon['d'] = Math.max(0, now() - (beacon['ts'] + vars.referenceTimestamp));

      if (vars.headersToCapture.length > 0) {
        captureHttpHeaders(beacon, xhr.getAllResponseHeaders());
      }

      if (state.performanceObserver && status > 0) {
        state.performanceObserver.onAfterResourceRetrieved();
      } else {
        if (state.performanceObserver) {
          state.performanceObserver.cancel();
        }
        sendBeacon(beacon);
      }
    }

    function onTimeout() {
      onFinish(additionalStatuses.timeout);
    }

    function onError(e) {
      if (state.ignored) {
        return;
      }

      let message = e && ((e.error && e.error.message) || e.message);
      if (typeof message === 'string') {
        beacon['e'] = message.substring(0, 300);
      }
      onFinish(additionalStatuses.error);
    }

    function onAbort() {
      onFinish(additionalStatuses.abort);
    }

    function onReadystatechange() {
      if (xhr.readyState === 4) {
        let status;

        try {
          status = xhr.status;
        } catch (e) {
          // IE 9 will throw errors when trying to access the status property
          // on aborted requests and timeouts. We can swallow the error
          // since we have separate event listeners for these types of
          // situations.
          onFinish(additionalStatuses.error);
          return;
        }

        if (status !== 0) {
          onFinish(status);
        }
      }
    }
  };

  XMLHttpRequest.prototype.setRequestHeader = function setRequestHeader(header, value) {
    const state = this[vars.secretPropertyKey];

    // If this request was initiated by a fetch polyfill, the Instana headers
    // will be set before xhr.send is called (by the fetch polyfill,
    // translating the headers from the request definition object into
    // XHR.setRequestHeader calls). We need to keep track of this so we can
    // set this XHR to ignored in xhr.send.
    if (state && traceIdHeaderRegEx.test(header)) {
      if (DEBUG) {
        debug(
          'Not generating XHR beacon because correlation header is already set (possibly fetch polyfill applied).'
        );
      }
      state.ignored = true;
      if (state.performanceObserver) {
        state.performanceObserver.cancel();
        state.performanceObserver = null;
      }
    } else {
      if (matchesAny(vars.headersToCapture, header)) {
        state.beacon['h_'+header.toLowerCase()] = value;
      }
    }
    return originalSetRequestHeader.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function send() {
    const state = this[vars.secretPropertyKey];
    if (!state || state.ignored) {
      return originalSend.apply(this, arguments);
    }

    if (state.setBackendCorrelationHeaders) {
      addCorrelationHttpHeaders(originalSetRequestHeader, this, state.spanAndTraceId);
    }

    state.beacon['ts'] = now() - vars.referenceTimestamp;
    addCommonBeaconProperties(state.beacon);
    state.performanceObserver.onBeforeResourceRetrieval();
    return originalSend.apply(this, arguments);
  };
}

function captureHttpHeaders(beacon, headerString) {

  const headers = {};
  const lines = headerString.trim().split(/[\r\n]+/);
  for( let i=0; i<lines.length; i++) {
    const items = lines[i].split(': ', 2);
    headers[items[0]] = items[1];
  }

  for(let key in headers) {
    if(matchesAny(vars.headersToCapture, key)){
      beacon['h_'+key.toLowerCase()] = headers[key];
    }
  }
}
