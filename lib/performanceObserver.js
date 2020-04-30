// @flow

import {performance, isPerformanceObserverAvailable} from './performance';
import {noop, now, addEventListener, removeEventListener} from './util';
import {setTimeout, clearTimeout} from './timers';
import {doc, win} from './browser';

const ONE_DAY_IN_MILLIS = 1000 * 60 * 60 * 24;

export type ObserveResourcePerformanceResult = {
  duration: number,
  resource: ?PerformanceResourceTiming
};

type ObserveResourcePerformanceResultCallback = ObserveResourcePerformanceResult => any;

type ObserveResourcePerformanceOptions = {
  entryTypes: string[],
  resourceMatcher:  PerformanceResourceTiming => boolean,
  maxWaitForResourceMillis: number,
  onEnd: ObserveResourcePerformanceResultCallback
};

// Implements the capability to observe the performance data for a single entry on the performance timeline.
// This is especially useful to make a connection between our beacon data and the performance timeline data.
// Also see https://w3c.github.io/performance-timeline/#dom-performanceentrylist
export function observeResourcePerformance(opts: ObserveResourcePerformanceOptions) {
  if (!isPerformanceObserverAvailable) {
    return observeWithoutPerformanceObserverSupport(opts.onEnd);
  }

  // Used to calculate the duration when no resource was found.
  let startTime;
  let endTime;

  // The identified resource. To be used when calling opts.onEnd
  let resource;

  // global resources that will need to be disposed
  let observer;
  let fallbackNoResourceFoundTimerHandle;
  let fallbackEndNeverCalledTimerHandle;

  return {
    onBeforeResourceRetrieval,
    onAfterResourceRetrieved,
    cancel: disposeGlobalResources
  };

  function onBeforeResourceRetrieval() {
    startTime = performance.now();
    try {
      observer = new win['PerformanceObserver'](onResource);
      observer['observe']({'entryTypes': opts.entryTypes});
    } catch (e) {
      // Some browsers may not support the passed entryTypes and decide to throw an error.
      // This would then result in an error with a message like:
      //
      // entryTypes only contained unsupported types
      //
      // Swallow and ignore the error. Treat it like unavailable performance observer data.
    }
    fallbackEndNeverCalledTimerHandle = setTimeout(disposeGlobalResources, 1000 * 60 * 10);
  }

  function onAfterResourceRetrieved() {
    endTime = performance.now();
    cancelFallbackEndNeverCalledTimerHandle();

    if (resource || !isWaitingAcceptable()) {
      end();
    } else {
      addEventListener(doc, 'visibilitychange', onVisibilityChanged);
      fallbackNoResourceFoundTimerHandle = setTimeout(end, opts.maxWaitForResourceMillis);
    }
  }

  function end() {
    disposeGlobalResources();

    let duration;
    if (resource && resource.duration != null &&
        // In some old web browsers, e.g. Chrome 31, the value provided as the duration
        // can be very wrong. We have seen cases where this value is measured in years.
        // If this does seem be the case, then we will ignore the duration property and
        // instead prefer our approximation.
        resource.duration < ONE_DAY_IN_MILLIS) {
      duration = Math.round(resource.duration);
    } else {
      duration = Math.round(endTime - startTime);
    }
    opts.onEnd({resource, duration});
  }

  function onResource(list) {
    const entries = list.getEntries();
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if (entry.startTime >= startTime
          && (!endTime || endTime >= entry.responseEnd)
          && opts.resourceMatcher(entry)) {
        resource = entry;
        disconnectResourceObserver();

        if (endTime) {
          // End as quickly as possible to ensure that the data is transmitted to the server.
          end();
        }

        return;
      }
    }
  }

  function onVisibilityChanged() {
    if (!isWaitingAcceptable()) {
      end();
    }
  }

  function disposeGlobalResources() {
    disconnectResourceObserver();
    cancelFallbackNoResourceFoundTimer();
    cancelFallbackEndNeverCalledTimerHandle();
    stopVisibilityObservation();
  }

  function disconnectResourceObserver() {
    if (observer) {
      try {
        observer['disconnect']();
      } catch (e) {
        // Observer disconnect may throw when connect attempt wasn't successful. Ignore this.
      }
      observer = null;
    }
  }

  function cancelFallbackNoResourceFoundTimer() {
    if (fallbackNoResourceFoundTimerHandle) {
      clearTimeout(fallbackNoResourceFoundTimerHandle);
      fallbackNoResourceFoundTimerHandle = null;
    }
  }

  function cancelFallbackEndNeverCalledTimerHandle() {
    if (fallbackEndNeverCalledTimerHandle) {
      clearTimeout(fallbackEndNeverCalledTimerHandle);
      fallbackEndNeverCalledTimerHandle = null;
    }
  }

  function stopVisibilityObservation() {
    removeEventListener(doc, 'visibilitychange', onVisibilityChanged);
  }
}

// This variant of the performance observer is only used when the performance-timeline features
// are not supported. See isPerformanceObserverAvailable
function observeWithoutPerformanceObserverSupport(onEnd: ObserveResourcePerformanceResultCallback) {
  let start;

  return {
    onBeforeResourceRetrieval,
    onAfterResourceRetrieved,
    cancel: noop
  };

  function onBeforeResourceRetrieval() {
    start = now();
  }

  function onAfterResourceRetrieved() {
    let end = now();
    onEnd({duration: end - start});
  }
}

// We may only wait for resource data to arrive as long as the document is visible or in the process
// of becoming visible. In all other cases we might lose data when waiting, e.g. when the document
// is in the process of being disposed.
function isWaitingAcceptable() {
  return doc.visibilityState === 'visible' || doc.visibilityState === 'prerender';
}
