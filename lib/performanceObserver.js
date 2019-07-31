// @flow

import {performance, isPerformanceObserverAvailable} from './performance';
import {noop, now, addEventListener, removeEventListener} from './util';
import {doc, win} from './browser';

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

// TODO call onEnd as quickly as possible
// TODO call onEnd early when window is getting hidden

// Implements the capability to observe the performance data for a single entry on the performance timeline.
// This is especially useful to make a connection between our beacon data and the performance timeline data.
// Also see https://w3c.github.io/performance-timeline/#dom-performanceentrylist
export function observeResourcePerformance(opts: ObserveResourcePerformanceOptions) {
  if (!isPerformanceObserverAvailable) {
    return observeWithoutPerformanceObserverSupport(opts.onEnd);
  }

  let startTime;
  let endTime;
  let observer;
  let resource;
  let endCalled = false;

  return {
    onBeforeResourceRetrieval,
    onAfterResourceRetrieved,
    cancel
  };

  function onBeforeResourceRetrieval() {
    startTime = performance.now();
    observer = new win.PerformanceObserver(onResource);
    observer.observe({'entryTypes': opts.entryTypes});

    // Safety net: Ensure that we do not leak memory by keeping observers connected.
    setTimeout(disconnect, 1000 * 60 * 10);
  }

  function onAfterResourceRetrieved() {
    endTime = performance.now();

    if (resource || !isWaitingAcceptable()) {
      end();
    } else {
      addEventListener(doc, 'visibilitychange', onVisibilityChanged);
      setTimeout(end, opts.maxWaitForResourceMillis);
    }
  }

  function cancel() {
    endCalled = true;
    disconnect();
    removeEventListener(doc, 'visibilitychange', onVisibilityChanged);
  }

  function end() {
    disconnect();
    removeEventListener(doc, 'visibilitychange', onVisibilityChanged);

    if (endCalled) {
      // avoid duplicate executions
      return;
    }

    endCalled = true;

    let duration;
    if (resource && resource.startTime > 0 && resource.responseEnd > 0) {
      duration = Math.round(resource.responseEnd - resource.startTime);
    } else {
      duration = Math.round(endTime - startTime);
    }
    opts.onEnd({resource, duration});
  }

  function disconnect() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  function onResource(list) {
    const entries = list.getEntries();
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if (entry.startTime >= startTime
          && (!endTime || endTime >= entry.responseEnd)
          && opts.resourceMatcher(entry)) {
        resource = entry;
        disconnect();

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
