import {performance, isResourceTimingAvailable, isPerformanceObserverAvailable} from '../performance';
import {pageLoadStartTimestamp} from '../timings';
import {reportCustomEvent} from '../customEvents';
import {matchesAny} from '../util';
import {win} from '../browser';
import {info} from '../debug';
import vars from '../vars';

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

  let duration;
  if (performanceEntry.entryType !== 'mark') {
    duration = Math.round(performanceEntry.duration);
  } else {
    // timestamp for mark also equals to "performance['timeOrigin'] + performanceEntry.startTime"
    // otherwise we'll see all UserTiming cus events starting at 0 offset to timeOrigin
    // which will cause confusion while UI ordering beacons by timestamp.
    //
    // see also: https://github.com/instana/weasel/pull/91/files#diff-6bfdd81c3c734033fa8c5709e4faee07476683733f76c3d254fc03841a125d27R44
    // basically we keep the duration change in this PR but revert the timestamp
    duration = Math.round(performanceEntry.startTime);
  }

  // We have to write it this way because of the Closure compiler advanced mode.
  reportCustomEvent(performanceEntry.name, {
    // Do not allow the timestamp to be before our Notion of page load start.
    'timestamp': Math.max(pageLoadStartTimestamp, Math.round(performance['timeOrigin'] + performanceEntry.startTime)),
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

function onObservedPerformanceEntries(list: PerformanceObserverEntryList) {
  onUserTimings(list.getEntries());
}
