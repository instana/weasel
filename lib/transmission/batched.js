// @flow

import { doc, nav, win, XMLHttpRequest, sendBeacon as sendBeaconInternal } from '../browser';
import { disableMonitoringForXMLHttpRequest } from '../hooks/XMLHttpRequest';
import { addEventListener } from '../util';
import { encode } from './lineEncoding';
import type { Beacon } from '../types';
import vars from '../vars';

const pendingBeacons: Array<Beacon> = [];
let pendingBeaconTransmittingTimeout;

const isVisibilityApiSupported = typeof doc.visibilityState === 'string';
const isSupported = !!XMLHttpRequest && isVisibilityApiSupported && isSendBeaconApiSupported();

export function isEnabled() {
  return isSupported && vars.beaconBatchingTime > 0;
}

// We attempt batching of messages to be more efficient on the client, network and
// server-side. While the connection is either a persistent HTTP 2 connection or
// a HTTP 1.1 connection with keep-alive, there is still some overhead involved
// in having many small messages.
//
// For this reason we attempt batching. When batching we must be careful to
// force a transmission when the document is unloaded. To handle the variety
// of unload cases, we are making use of the Page Visibility API. This abstracts
// all unload cases.
if (isSupported) {
  addEventListener(doc, 'visibilitychange', function() {
    if (isWindowHidden()) {
      transmit();
    }
  });

  // According to the spec visibilitychange should be a replacement for
  // beforeunload, but the reality is different (as of 2019-04-17). Chrome will
  // close tabs without firing visibilitychange. beforeunload on the other hand
  // is fired.
  addEventListener(win, 'beforeunload', transmit);
}

export function sendBeacon(beacon: Beacon) {
  pendingBeacons.push(beacon);

  // We cannot guarantee that we will ever get time to transmit data in a batched
  // format when the window is hidden, as this might occur while the document is
  // being unloaded. Immediately force a transmission in these cases.
  if (!isWindowHidden() && vars.beaconBatchingTime > 0) {
    if (pendingBeaconTransmittingTimeout == null) {
      pendingBeaconTransmittingTimeout = setTimeout(transmit, vars.beaconBatchingTime);
    }
  } else {
    transmit();
  }
}

function transmit() {
  if (pendingBeaconTransmittingTimeout != null) {
    clearTimeout(pendingBeaconTransmittingTimeout);
    pendingBeaconTransmittingTimeout = null;
  }

  if (pendingBeacons.length === 0) {
    return;
  }

  const serializedBeacons = encode(pendingBeacons);
  // clear the array
  pendingBeacons.length = 0;

  // Empty beacons. Should never happen, but better be safe.
  if (serializedBeacons.length === 0) {
    return;
  }

  // This will transmit a text/plain;charset=UTF-8 content type. This may not be what we
  // want, but changing the content type via the Blob constructor currently
  // breaks for cross-origin requests.
  // https://bugs.chromium.org/p/chromium/issues/detail?id=490015
  const sendBeaconState = isSendBeaconApiSupported() && sendBeaconInternal(String(vars.reportingUrl), serializedBeacons);

  // There are limits to the amount of data transmittable via the sendBeacon API.
  // If it doesn't work via the sendBeacon, try it via plain old AJAX APIs
  // as a last resort.
  if (sendBeaconState === false) {
    const xhr = new XMLHttpRequest();
    disableMonitoringForXMLHttpRequest(xhr);
    xhr.open('POST', String(vars.reportingUrl), true);
    xhr.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
    // Ensure that browsers do not try to automatically parse the response.
    xhr.responseType = 'text';
    xhr.timeout = vars.xhrTransmissionTimeout;
    xhr.send(serializedBeacons);
  }
}

function isWindowHidden() {
  return doc.visibilityState !== 'visible';
}

function isSendBeaconApiSupported() {
  return typeof nav.sendBeacon === 'function';
}
