import { doc, nav, XMLHttpRequest, sendBeacon as sendBeaconInternal } from '../browser';
import { disableMonitoringForXMLHttpRequest } from '../hooks/xhrHelpers';
import {onLastChance} from '../events/onLastChance';
import {setTimeout, clearTimeout} from '../timers';
import { encode } from './lineEncoding';
import type { Beacon, ReportingBackend } from '../types';
import { warn } from '../debug';
import vars from '../vars';

const maxBatchedBeacons = 15;

const pendingBeacons: Array<Partial<Beacon>> = [];
let pendingBeaconTransmittingTimeout: ReturnType<typeof setTimeout> | null;

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
// force a transmission when the document is unloaded.
if (isSupported) {
  onLastChance(transmit);
}

export function sendBeacon(beacon: Partial<Beacon>) {
  pendingBeacons.push(beacon);

  if (pendingBeacons.length >= maxBatchedBeacons) {
    transmit();
  } else if (!isWindowHidden() && vars.beaconBatchingTime > 0) {
    // We cannot guarantee that we will ever get time to transmit data in a batched
    // format when the window is hidden, as this might occur while the document is
    // being unloaded. Immediately force a transmission in these cases.
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

  if (vars.reportingBackends && vars.reportingBackends.length > 0) {
    for (let i = 0, len = vars.reportingBackends.length; i < len; i++) {
      const reportingBackend: ReportingBackend = vars.reportingBackends[i];
      if (i > 0) {
        for (let j = 0, length = pendingBeacons.length; j < length; j++) {
          const beacon: Partial<Beacon> = pendingBeacons[j];
          beacon['k'] = reportingBackend['key'];
        }
      }
      transmitBeacons(encode(pendingBeacons), reportingBackend['reportingUrl']);
    }
  } else {
    transmitBeacons(encode(pendingBeacons), String(vars.reportingUrl));
  }

  // clear the array
  pendingBeacons.length = 0;
}

function transmitBeacons(serializedBeacons: string, reportingUrl: string) {
  // Empty beacons. Should never happen, but better be safe.
  if (!serializedBeacons || serializedBeacons.length === 0 || !reportingUrl || reportingUrl.length === 0) {
    return;
  }

  let sendBeaconState = false;
  if (isSendBeaconApiSupported()) {
    try {
      // This will transmit a text/plain;charset=UTF-8 content type. This may not be what we
      // want, but changing the content type via the Blob constructor currently
      // breaks for cross-origin requests.
      // https://bugs.chromium.org/p/chromium/issues/detail?id=490015
      sendBeaconState = sendBeaconInternal(String(reportingUrl), serializedBeacons);
    } catch (e) {
      // We have received reports that the navigator.sendBeacon API is failing in certain
      // Edge 14.x versions. Unfortunately, we cannot reproduce this with our existing
      // testing facilities. So we add a try/catch with logging and XMLHttpRequest
      // as a fallback.
      if (DEBUG) {
        warn(
          'navigator.sendBeacon has thrown an unexpected error. Will fall back to other transmission strategy.',
          'navigator.sendBeacon parameters:',
          String(vars.reportingUrl),
          serializedBeacons
        );
      }
    }
  }

  // There are limits to the amount of data transmittable via the sendBeacon API.
  // If it doesn't work via the sendBeacon, try it via plain old AJAX APIs
  // as a last resort.
  if (sendBeaconState === false) {
    const xhr = new XMLHttpRequest();
    disableMonitoringForXMLHttpRequest(xhr);
    xhr.open('POST', String(reportingUrl), true);
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
