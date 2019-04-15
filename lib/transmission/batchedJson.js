// @flow

import { win, doc, nav, OriginalXMLHttpRequest } from '../browser';
import { addEventListener } from '../util';
import type { Beacon } from '../types';
import vars from '../vars';

const pendingBeacons: Array<Beacon> = [];
let pendingBeaconTransmittingTimeout;

export const isSupported =
  !!OriginalXMLHttpRequest &&
  !!win.JSON &&
  isVisibilityApiSupported() &&
  typeof vars.beaconBatchingTime === 'number' &&
  vars.beaconBatchingTime > 0 &&
  typeof nav.sendBeacon === 'function';

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
}

export function sendBeacon(beacon: Beacon) {
  pendingBeacons.push(beacon);

  if (isWindowHidden()) {
    // We cannot guarantee that we will ever get time to transmit data in a batched
    // format, as this might occur while the document is being unloaded.
    // Immediately force a transmission.
    transmit();
    return;
  }

  // Once we reach this stage we know that we want to send out data in batches.
  // Schedule a new batch transmission only when there currently isn't a batch
  // transmission already scheduled.
  if (pendingBeaconTransmittingTimeout == null) {
    pendingBeaconTransmittingTimeout = setTimeout(transmit, vars.beaconBatchingTime);
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

  const serializedBeacons = win.JSON.stringify(pendingBeacons);
  // clear the array
  pendingBeacons.length = 0;

  // This will transmit a text/plain;charset=UTF-8 content type. This is not what we
  // want, but changing the content type via the Blob constructor currently
  // breaks for cross-origin requests.
  // https://bugs.chromium.org/p/chromium/issues/detail?id=490015
  const sendBeaconState = nav.sendBeacon(String(vars.reportingUrl), serializedBeacons);

  // There are limits to the amount of data transmittable via the sendBeacon API.
  // If it doesn't work via the sendBeacon, try it via plain old AJAX APIs
  // as a last resort.
  if (sendBeaconState === false) {
    const xhr = new OriginalXMLHttpRequest();
    xhr.open('POST', String(vars.reportingUrl), true);
    xhr.setRequestHeader('Content-type', 'application/json;charset=UTF-8');
    // Ensure that browsers do not try to automatically parse the response.
    xhr.responseType = 'text';
    xhr.timeout = vars.xhrTransmissionTimeout;
    xhr.send(serializedBeacons);
  }
}

function isWindowHidden() {
  return doc.visibilityState === 'hidden';
}

function isVisibilityApiSupported() {
  return typeof doc.visibilityState === 'string';
}
