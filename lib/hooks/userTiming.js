// @flow

import {performance, isResourceTimingAvailable, isPerformanceObserverAvailable} from '../performance';
import {createExcessiveUsageIdentifier} from '../excessiveUsageIdentification';
import {reportCustomEvent} from '../customEvents';
import {matchesAny} from '../util';
import {win} from '../browser';
import {info} from '../debug';
import vars from '../vars';

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
  if (matchesAny(vars.ignoreUserTimings, performanceEntry.name)) {
    if (DEBUG) {
      info('Ignoring user timing "%s" because it is ignored via the configuration.', performanceEntry.name);
    }
    return;
  }

  if (isExcessiveUsage()) {
    if (DEBUG) {
      info('Reached the maximum number of user timings to monitor');
    }
    return;
  }

  let duration;
  if (performanceEntry.entryType !== 'mark') {
    duration = Math.round(performanceEntry.duration);
  }

  // $FlowFixMe: Flow cannot detect that this is a proper usage of the function. We have to write it this way because of the Closure compiler advanced mode.
  reportCustomEvent(performanceEntry.name, {
    'timestamp': Math.round(performance['timeOrigin'] + performanceEntry.startTime),
    'duration': duration,
    'meta': {
      'userTimingType': performanceEntry.entryType
    }
  });
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
