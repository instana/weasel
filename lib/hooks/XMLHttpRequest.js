// @flow

import {OriginalXMLHttpRequest, win} from '../browser';
import {now, generateUniqueId} from '../util';
import {sendBeacon} from '../transmission';
import {getActiveTraceId} from '../fsm';
import type {XhrBeacon} from '../types';
import {info} from '../debug';
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
    const originalSend = xhr.send;

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

    function onFinish(status) {
      if (beacon['st'] !== 0) {
        // Multiple finish events. Should only happen when we setup the event handlers
        // in a wrong way or when the XHR object is reused. We don't support this use
        // case.
        return;
      }

      beacon['st'] = status;
      // $FlowFixMe: Not sure why flow thinks that the ts value is a string :(
      beacon['d'] = now() - (beacon['ts'] + vars.referenceTimestamp);
      sendBeacon(beacon);
    }

    xhr.addEventListener('timeout', function onTimeout() {
      onFinish(additionalStatuses.timeout);
    });

    xhr.addEventListener('error', function onError(e) {
      let message = e && ((e.error && e.error.message) || e.message);
      if (typeof message === 'string') {
        beacon['e'] = message.substring(0, 300);
      }
      onFinish(additionalStatuses.error);
    });

    xhr.addEventListener('abort', function onAbort() {
      onFinish(additionalStatuses.abort);
    });

    xhr.addEventListener('readystatechange', function onReadystatechange() {
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
      if (async === undefined) {
        async = true;
      }

      let traceId = getActiveTraceId();
      const spanId = generateUniqueId();
      if (!traceId) {
        traceId = spanId;
      }

      beacon['t'] = traceId;
      beacon['s'] = spanId;
      beacon['m'] = method;
      beacon['u'] = url;
      beacon['a'] = async ? 1 : 0;

      try {
        const result = originalOpen.apply(xhr, arguments);

        if (isSameOrigin(url)) {
          xhr.setRequestHeader('X-INSTANA-T', traceId);
          xhr.setRequestHeader('X-INSTANA-S', spanId);
          xhr.setRequestHeader('X-INSTANA-L', '1');
        }

        return result;
      } catch (e) {
        beacon['ts'] = now() - vars.referenceTimestamp;
        beacon['st'] = additionalStatuses.openError;
        beacon['e'] = e.message;
        sendBeacon(beacon);
        throw e;
      }
    };

    xhr.send = function send() {
      beacon['ts'] = now() - vars.referenceTimestamp;
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

function isSameOrigin(url) {
  try {
    const a = document.createElement('a');
    a.href = url;

    const loc = win.location;
    // Most browsers support this fallback logic out of the box. Not so the Internet explorer.
    // To make it work in Internet explorer, we need to add the fallback manually.
    // IE 9 uses a colon as the protocol when no protocol is defined
    return (a.protocol && a.protocol !== ':' ? a.protocol : loc.protocol) === loc.protocol &&
      (a.hostname || loc.hostname) === loc.hostname &&
      (a.port || loc.port) === loc.port;
  } catch (e) {
    return false;
  }
}
