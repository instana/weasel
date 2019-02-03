// @flow

import {addCommonBeaconProperties} from '../commonBeaconProperties';
import {isWhitelistedOrigin} from '../whitelistedOrigins';
import {OriginalXMLHttpRequest, win} from '../browser';
import {now, generateUniqueId} from '../util';
import {normalizeUrl} from './normalizeUrl';
import {isUrlIgnored} from '../ignoreRules';
import {sendBeacon} from '../transmission';
import {getActiveTraceId} from '../fsm';
import type {XhrBeacon} from '../types';
import {debug, info} from '../debug';
import {isSameOrigin} from '../sop';
import vars from '../vars';

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
  if (!OriginalXMLHttpRequest ||
      !(new OriginalXMLHttpRequest()).addEventListener) {
    if (DEBUG) {
      info('Browser does not support the features required for XHR instrumentation.');
    }
    return;
  }

  function InstrumentedXMLHttpRequest() {
    const xhr = new OriginalXMLHttpRequest();

    const originalOpen = xhr.open;
    const originalSetRequestHeader = xhr.setRequestHeader;
    const originalSend = xhr.send;

    // $FlowFixMe: Some properties deliberately left our for js file size reasons.
    const beacon: XhrBeacon = {
      // general beacon data
      // 't': '',
      'ts': 0,
      'd': 0,

      // xhr beacon specific data
      'ty': 'xhr',
      // 's': '',
      'l': win.location.href,
      'm': '',
      'u': '',
      'a': 1,
      'st': 0,
      'e': undefined
    };

    // Whether or not we should ignore this beacon, e.g. because the URL is ignored.
    let ignored = false;

    let traceId;
    let spanId;
    let setBackendCorrelationHeaders = false;

    function onFinish(status) {
      if (ignored) return;

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
      sendBeacon(beacon);
    }

    xhr.addEventListener('timeout', function onTimeout() {
      if (ignored) return;

      onFinish(additionalStatuses.timeout);
    });

    xhr.addEventListener('error', function onError(e) {
      if (ignored) return;

      let message = e && ((e.error && e.error.message) || e.message);
      if (typeof message === 'string') {
        beacon['e'] = message.substring(0, 300);
      }
      onFinish(additionalStatuses.error);
    });

    xhr.addEventListener('abort', function onAbort() {
      if (ignored) return;

      onFinish(additionalStatuses.abort);
    });

    xhr.addEventListener('readystatechange', function onReadystatechange() {
      if (ignored) return;

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
    });

    xhr.open = function open(method, url, async) {
      const urlIgnored = isUrlIgnored(url);
      ignored = ignored || urlIgnored;
      if (DEBUG && urlIgnored) {
        debug(
          'Not generating XHR beacon because it should be ignored according to user configuration. URL: ' + url
        );
      }
      if (ignored) {
        return originalOpen.apply(xhr, arguments);
      }

      if (async === undefined) {
        async = true;
      }

      traceId = getActiveTraceId();
      spanId = generateUniqueId();
      if (!traceId) {
        traceId = spanId;
      }

      setBackendCorrelationHeaders = isSameOrigin(url) || isWhitelistedOrigin(url);

      beacon['t'] = traceId;
      beacon['s'] = spanId;
      beacon['m'] = method;
      beacon['u'] = normalizeUrl(url);
      beacon['a'] = async ? 1 : 0;
      beacon['bc'] = setBackendCorrelationHeaders ? 1 : 0;

      try {
        return originalOpen.apply(xhr, arguments);
      } catch (e) {
        beacon['ts'] = now() - vars.referenceTimestamp;
        beacon['st'] = additionalStatuses.openError;
        beacon['e'] = e.message;
        addCommonBeaconProperties(beacon);
        sendBeacon(beacon);
        throw e;
      }
    };

    xhr.setRequestHeader = function setRequestHeader(header) {
      // If this request was initiated by a fetch polyfill, the Instana headers
      // will be set before xhr.send is called (by the fetch polyfill,
      // translating the headers from the request definition object into
      // XHR.setRequestHeader calls). We need to keep track of this so we can
      // set this XHR to ignored in xhr.send.
      if (traceIdHeaderRegEx.test(header)) {
        if (DEBUG) {
          debug(
            'Not generating XHR beacon because correlation header is already set (possibly fetch polyfill applied).'
          );
        }
        ignored = true;
      }
      return originalSetRequestHeader.apply(xhr, arguments);
    };

    xhr.send = function send() {
      if (ignored) {
        return originalSend.apply(xhr, arguments);
      }

      if (setBackendCorrelationHeaders) {
        originalSetRequestHeader.call(xhr, 'X-INSTANA-T', traceId);
        originalSetRequestHeader.call(xhr, 'X-INSTANA-S', spanId);
        originalSetRequestHeader.call(xhr, 'X-INSTANA-L', '1');
      }

      beacon['ts'] = now() - vars.referenceTimestamp;
      addCommonBeaconProperties(beacon);
      return originalSend.apply(xhr, arguments);
    };

    return xhr;
  }

  InstrumentedXMLHttpRequest.prototype = OriginalXMLHttpRequest.prototype;
  InstrumentedXMLHttpRequest.DONE = OriginalXMLHttpRequest.DONE;
  InstrumentedXMLHttpRequest.HEADERS_RECEIVED = OriginalXMLHttpRequest.HEADERS_RECEIVED;
  InstrumentedXMLHttpRequest.LOADING = OriginalXMLHttpRequest.LOADING;
  InstrumentedXMLHttpRequest.OPENED = OriginalXMLHttpRequest.OPENED;
  InstrumentedXMLHttpRequest.UNSENT = OriginalXMLHttpRequest.UNSENT;
  win.XMLHttpRequest = InstrumentedXMLHttpRequest;
}
