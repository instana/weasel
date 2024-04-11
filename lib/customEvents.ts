import {addCommonBeaconProperties, addMetaDataToBeacon} from './commonBeaconProperties';
import {createExcessiveUsageIdentifier} from './excessiveUsageIdentification';
import type {CustomEventBeacon, CustomEventOptions} from './types';
import {shortenStackTrace} from './hooks/unhandledError';
import {sendBeacon} from './transmission/index';
import {now, generateUniqueId} from './util';
import {getActiveTraceId} from './fsm';
import {info} from './debug';

const isExcessiveUsage = createExcessiveUsageIdentifier({
  maxCallsPerTenMinutes: 128,
  maxCallsPerTenSeconds: 32
});

export function reportCustomEvent(eventName: string, opts?: Partial<CustomEventOptions>): void {
  if (isExcessiveUsage()) {
    if (DEBUG) {
      info('Reached the maximum number of custom events to monitor');
    }
    return;
  }

  let traceId = getActiveTraceId();
  const spanId = generateUniqueId();
  if (!traceId) {
    traceId = spanId;
  }

  // Some properties deliberately left our for js file size reasons.
  const beacon: Partial<CustomEventBeacon> = {
    'ty': 'cus',
    's': spanId,
    't': traceId,
    'ts': now(),
    'n': eventName
  };

  addCommonBeaconProperties(beacon);

  if (opts) {
    enrich(beacon as CustomEventBeacon, opts);
  }

  sendBeacon(beacon as CustomEventBeacon);
}

function enrich(beacon: CustomEventBeacon, opts: Partial<CustomEventOptions>) {
  if (opts['meta']) {
    addMetaDataToBeacon(beacon, opts['meta']);
  }

  if (typeof opts['duration'] === 'number' && !isNaN(opts['duration'])) {
    beacon['d'] = opts['duration'];
    // add Math.round since duration could be a float
    // We know that both properties are numbers. Flow thinks they are strings because we access them via […].
    beacon['ts'] = Math.round(beacon['ts'] - opts['duration']);
  }

  if (typeof opts['timestamp'] === 'number' && !isNaN(opts['timestamp'])) {
    beacon['ts'] = opts['timestamp'];
  }

  if (
    typeof opts['backendTraceId'] === 'string' &&
    (opts['backendTraceId'].length === 16 || opts['backendTraceId'].length === 32)
  ) {
    beacon['bt'] = opts['backendTraceId'];
  }

  if (opts['error']) {
    beacon['e'] = String(opts['error']['message']).substring(0, 300);
    beacon['st'] = shortenStackTrace(opts['error']['stack']);
  }

  if (typeof opts['componentStack'] === 'string') {
    beacon['cs'] = opts['componentStack'].substring(0, 4096);
  }

  if (typeof opts['customMetric'] === 'number') {
    beacon['cm'] = opts['customMetric'];
  }
}
