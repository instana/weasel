// @flow

import {performance, isResourceTimingAvailable, isPerformanceObserverAvailable} from '../performance';
import {createExcessiveUsageIdentifier} from '../excessiveUsageIdentification';
import {addCommonBeaconProperties} from '../commonBeaconProperties';
import {sendBeacon} from '../transmission/index';
import type {CustomEventBeacon} from '../types';
import {generateUniqueId} from '../util';
import {getActiveTraceId} from '../fsm';
import {win} from '../browser';
import {info} from '../debug';

const isExcessiveUsage = createExcessiveUsageIdentifier({
  maxCalls: 64,
  maxCallsPerTenSeconds: 32
});

export function hookIntoUserTimings() {
  if (performance && performance['timeOrigin'] && isResourceTimingAvailable) {
    drainExistingPerformanceEntries();
    observeNewUserTimings();
  }
}

function drainExistingPerformanceEntries() {
  onUserTimings(performance.getEntriesByType('mark'));
  onUserTimings(performance.getEntriesByType('measure'));
}

function onUserTimings(performanceEntries: PerformanceEntry[]) {
  for (let i = 0; i < performanceEntries.length; i++) {
    onUserTiming(performanceEntries[i]);
  }
}

function onUserTiming(performanceEntry: PerformanceEntry) {
  if (isExcessiveUsage()) {
    if (DEBUG) {
      info('Reached the maximum number of user timings to monitor');
    }
    return;
  }

  let traceId = getActiveTraceId();
  const spanId = generateUniqueId();
  if (!traceId) {
    traceId = spanId;
  }

  let duration;
  if (performanceEntry.entryType !== 'mark') {
    duration = Math.round(performanceEntry.duration);
  }

  // $FlowFixMe: Some properties deliberately left our for js file size reasons.
  const beacon: CustomEventBeacon = {
    'ty': 'cus',
    's': spanId,
    't': traceId,
    'ts': Math.round(performance['timeOrigin'] + performanceEntry.startTime),
    'n': performanceEntry.name,
    'd': duration,
    'm_userTimingType': performanceEntry.entryType
  };
  addCommonBeaconProperties(beacon);
  sendBeacon(beacon);
}

function observeNewUserTimings() {
  if (isPerformanceObserverAvailable) {
    try {
      const observer = new win['PerformanceObserver'](onObservedPerformanceEntries);
      observer['observe']({'entryTypes': ['mark', 'measure']});
    } catch (e) {
      // Some browsers may not support the passed entryTypes and decide to throw an error.
      // This would then result in an error with a message like:
      //
      // entryTypes only contained unsupported types
      //
      // Swallow and ignore the error. Treat it like unavailable performance observer data.
    }
  }
}

function onObservedPerformanceEntries(list) {
  onUserTimings(list.getEntries());
}
