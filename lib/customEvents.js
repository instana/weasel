// @flow

import {addCommonBeaconProperties, addMetaDataToBeacon} from './commonBeaconProperties';
import type {CustomEventBeacon, CustomEventOptions} from './types';
import {shortenStackTrace} from './hooks/unhandledError';
import {now, generateUniqueId} from './util';
import {sendBeacon} from './transmission';
import {getActiveTraceId} from './fsm';
import {win} from './browser';

export function reportCustomEvent(eventName: string, opts: ?CustomEventOptions): void {
  let traceId = getActiveTraceId();
  const spanId = generateUniqueId();
  if (!traceId) {
    traceId = spanId;
  }

  // $FlowFixMe: Some properties deliberately left our for js file size reasons.
  const beacon: CustomEventBeacon = {
    's': spanId,
    't': traceId,
    'ts': now(),

    'ty': 'cus',
    'n': eventName,
    'l': win.location.href
  };

  addCommonBeaconProperties(beacon);

  if (opts) {
    enrich(beacon, opts);
  }

  sendBeacon(beacon);
}

function enrich(beacon: CustomEventBeacon, opts: CustomEventOptions) {
  if (opts['meta']) {
    addMetaDataToBeacon(beacon, opts['meta']);
  }

  if (typeof opts['duration'] === 'number') {
    beacon['d'] = opts['duration'];
  }

  if (typeof opts['backendTraceId'] === 'string') {
    beacon['bt'] = opts['backendTraceId'].substring(0, 64);
  }

  if (opts['error']) {
    beacon['e'] = String(opts['error']['message']).substring(0, 300);
    beacon['st'] = shortenStackTrace(opts['error']['stack']);
  }

  if (typeof opts['componentStack'] === 'string') {
    beacon['cs'] = opts['componentStack'].substring(0, 4096);
  }
}
