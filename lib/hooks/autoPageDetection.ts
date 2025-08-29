import { win, doc } from '../browser';
import type { AutoPageDetectionType, MappingRule, TransitionData } from '../types';
import vars from '../vars';
import { info, debug, error } from '../debug';
import { setPage } from '../pageChange';
import shimmer from 'shimmer';
import { isWrapped } from '../utilWrap';
import { normalizeUrl } from './normalizeUrl';
import { stripSecrets } from '../stripSecrets';
import { getActivePhase } from '../fsm';
import { setTimeout } from '../timers';
import { setPageTransitionData } from '../pageTransitionData';
import { observeResourcePerformance } from '../performanceObserver';

// Polyfill for requestIdleCallback
const requestIdleCallback = (callback: IdleRequestCallback): number => {
  return win.setTimeout(() => {
    const start = Date.now();
    callback({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
    });
  }, 1);
};

const transitionData: TransitionData = {};

/**
 * Calculate and display the total transition time when transition duration is available
 * If resource duration is available, include it in the calculation
 * If not, total is just the transition duration
 * If there's a pending page change, complete it with the calculated duration
 */
function calculateTotalTransitionTime(): void {
  const {
    transitionDuration,
    resourceDuration,
    timestamp,
    eventType,
    pendingPageChange,
  } = transitionData;

  if (transitionDuration === undefined) return;

  let totalDuration = transitionDuration;
  let logMessage = '';

  // Include resource duration if available
  if (resourceDuration !== undefined) {
    totalDuration += resourceDuration;
    logMessage = `PageChange:: Total transition time: ${totalDuration.toFixed(2)}ms (Resource: ${resourceDuration.toFixed(2)}ms + Transition: ${transitionDuration.toFixed(2)}ms)`;
  } else {
    logMessage = `PageChange:: Total transition time: ${totalDuration.toFixed(2)}ms (Transition only)`;
  }

  // Append timestamp and event type info if available
  if (timestamp) {
    const eventInfo = eventType ? ` (Event: ${eventType})` : '';
    logMessage += `PageChange:: | Timestamp: ${new Date(timestamp).toISOString()}${eventInfo}`;
  }

  if (DEBUG) info(logMessage);

  // Store total duration for beacon
  transitionData.totalDuration = totalDuration;

  // Handle pending page change if any
  if (pendingPageChange) {
    const { url, customizedPageName } = pendingPageChange;
    if (DEBUG) info('PageChange:: handlePossibleUrlChange triggered by pendingPageChange');
    setPageWithConditions(url, customizedPageName, url);
    transitionData.pendingPageChange = undefined;
  }

  // Clear durations after calculation
  transitionData.transitionDuration = undefined;
  transitionData.resourceDuration = undefined;
}


export function configAutoPageDetection() {
  resetPageDetectionState();

  if (!isAutoPageDetectionEnabled()) return;

  wrapHistoryMethods();

  win.addEventListener('hashchange', hashChangeEventListener);
  isHashChangeListenerAdded = true;

  if (!ignorePopstateEvent()) {
    if (DEBUG) info('PageChange:: handlePossibleUrlChange on popstate event received');
    win.addEventListener('popstate', popStateEventListener);
    isPopstateEventListenerAdded = true;
  }

  if (getActivePhase() === 'pl') {
    handlePossibleUrlChange(window.location.pathname);
  }
}

let activeResourceObserver: any = null;

function startResourceObservation() {
  transitionData.state = 'wait';
  cancelActiveObserverIfNeeded();

  activeResourceObserver = createResourceObserver();
  activeResourceObserver.onBeforeResourceRetrieval();
}

function cancelActiveObserverIfNeeded() {
  if (activeResourceObserver?.cancel) {
    activeResourceObserver.cancel();
  }
}

function createResourceObserver() {
  return observeResourcePerformance({
    entryTypes: ['resource'],
    resourceMatcher: isRelevantResourceType,
    maxWaitForResourceMillis: 3000,
    maxToleranceForResourceTimingsMillis: 800,
    onEnd: handleResourceObservationEnd as (arg: { resource?: PerformanceResourceTiming | null, duration: number }) => void
  });
}

function isRelevantResourceType(entry: PerformanceResourceTiming): boolean {
  const allowedTypes = ['fetch', 'xmlhttprequest', 'script', 'img', 'link'];
  return allowedTypes.includes(entry.initiatorType);
}

function handleResourceObservationEnd({ resource, duration }: { resource?: PerformanceResourceTiming | null, duration: number }): void {
  const resourceDuration = parseFloat(duration.toFixed(2));

  if (resource) {
    if (DEBUG) info(`PageChange:: Last resource loaded: ${resource.name} transition took ${resourceDuration}ms`);
    transitionData.resourceDuration = resourceDuration;
  } else {
    if (DEBUG) info('PageChange:: This is with no resource time');
  }

  calculateTotalTransitionTime();
  transitionData.state = 'done';
}

function endResourceObservation() {
  transitionData.state = 'done';
  if (activeResourceObserver) {
    activeResourceObserver.onAfterResourceRetrieved();
  }
}

let isHashChangeListenerAdded = false;
let isPopstateEventListenerAdded = false;

function resetPageDetectionState() {
  unwrapHistoryMethods();
  if (isHashChangeListenerAdded) {
    win.removeEventListener('hashchange', hashChangeEventListener);
    isHashChangeListenerAdded = false;
  }
  if (isPopstateEventListenerAdded) {
    win.removeEventListener('popstate', popStateEventListener);
    isPopstateEventListenerAdded = false;
  }
}

function hashChangeEventListener(event: HashChangeEvent) {
  if (DEBUG) info(`PageChange:: hashchange to ${event.newURL} from ${event.oldURL}, current location ${win.location}`);

  try {
    startResourceObservation();
    performance.mark('routeChangeStart');
  } catch (e) {
    if (DEBUG) {
      info('PageChange:: Failed to mark hashchange routeChangeStart', e);
    }
  }

  requestIdleCallback(() => endRouteAndUpdateTime('hashchange'));
  handlePossibleUrlChange(event.newURL);
}

function popStateEventListener(_event: PopStateEvent) {
  if (DEBUG) info(`PageChange:: popstate current location ${win.location}`);

  try {
    startResourceObservation();
    performance.mark('routeChangeStart');
  } catch (e) {
    if (DEBUG) {
      info('PageChange:: Failed to mark popstate routeChangeStart', e);
    }
  }

  requestIdleCallback(() => endRouteAndUpdateTime('popstate'));
  handlePossibleUrlChange(window.location.pathname);
}

function endRouteAndUpdateTime(routeName: string) {
  Promise.resolve().then(() => {
    setTimeout(() => {
      try {
        finalizePerformanceTracking(routeName);
      } catch (err) {
        if (DEBUG) {
          info(`PageChange:: [RouteTiming] ${routeName} - measurement failed:`, err);
        }
      } finally {
        cleanupPerformanceEntries();
      }
    }, 100);
  });
}

function finalizePerformanceTracking(routeName: string) {
  endResourceObservation();

  performance.mark('routeChangeEnd');
  safeMeasure('PageTransition', 'routeChangeStart', 'routeChangeEnd');

  const [measure] = performance.getEntriesByName('PageTransition');
  if (measure) {
    const duration = parseFloat(measure.duration.toFixed(2));
    if (DEBUG) {
      info(`PageChange:: [RouteTiming] ${routeName} transition duration: ${duration}ms`);
    }

    transitionData.transitionDuration = duration;
    processPendingPageTransition();
  }

}

function cleanupPerformanceEntries() {
  performance.clearMarks('routeChangeStart');
  performance.clearMarks('routeChangeEnd');
  performance.clearMeasures('PageTransition');
}

/**
 * Do not need to wrap history.go, history.backward and history.forward
 * since they do not bring location information in time.
 * hashchange and popstate serve better roles here.
 * Old and new url information is carried by hashchange event.
 * For popstate event, window.location is already updated with new location.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/History/pushState#description
 * Note that pushState() never causes a hashchange event to be fired,
 * even if the new URL differs from the old URL only in its hash.
 */
function wrapHistoryMethods() {
  shimmer.wrap(win.history, 'replaceState', _patchHistoryMethod('replaceState'));
  shimmer.wrap(win.history, 'pushState', _patchHistoryMethod('pushState'));
}

function unwrapHistoryMethods() {
  if (isWrapped(win.history.replaceState)) {
    if (DEBUG) info('unwrap history.replaceState');
    shimmer.unwrap(history, 'replaceState');
  }
  if (isWrapped(win.history.pushState)) {
    if (DEBUG) info('unwrap history.pushState');
    shimmer.unwrap(history, 'pushState');
  }
}

function _patchHistoryMethod(methodName: string) {
  return (original: any) => {
    if (DEBUG) info(`patching history ${methodName}`);

    return function patchHistoryMethod(this: History, ...args: unknown[]) {
      if (DEBUG) debug(`history ${methodName} invoked with`, args);

      // Record timestamp and event type
      transitionData.timestamp = Date.now();
      transitionData.eventType = methodName;

      try {
        startResourceObservation();
        performance.mark('routeChangeStart');
      } catch (e) {
        if (DEBUG) info('PageChange:: Failed to mark routeChangeStart', e);
      }

      const result = original.apply(this, args);

      requestIdleCallback(() => endRouteAndUpdateTime('pagechange'));
      updateLocation(args);

      return result;
    };
  };
}

function safeMeasure(name: string, startMark: string, endMark: string) {
  const hasStart = performance.getEntriesByName(startMark).length > 0;
  const hasEnd = performance.getEntriesByName(endMark).length > 0;

  if (hasStart && hasEnd) {
    performance.measure(name, startMark, endMark);
    return performance.getEntriesByName(name)[0]?.duration ?? null;
  } else {
    if (DEBUG) info(`PageChange:: Missing marks for measure '${name}':`, { hasStart, hasEnd });
    return null;
  }
}

function updateLocation(args: unknown[]) {
  // pushState(state, unused)
  // pushState(state, unused, url)
  // replaceState(state, unused)
  // replaceState(state, unused, url)

  // replaceState:
  // For React, arguments length is 2, so no place for new url.
  // For Angular, arguments length is 3. 3rd argument is new url.
  // pushState: Observation is argument length is always 3.
  const newUrl = args.length > 2 ? args[2] : null;
  if (newUrl) {
    handlePossibleUrlChange(String(newUrl));
  }
}

function handlePossibleUrlChange(newUrl: string) {
  if (!transitionData.timestamp) {
    transitionData.timestamp = Date.now();
  }
  if (!transitionData.eventType || newUrl.includes('#')) {
    transitionData.eventType = newUrl.includes('#') ? 'hashchange' : transitionData.eventType || 'navigation';
  }
  const normalizedUrl = normalizeUrl(newUrl, true);
  const customizedPageName = applyCustomPageMappings(removeUrlOrigin(normalizedUrl));
  if (!customizedPageName) return;
  setPageWithConditions(normalizedUrl, customizedPageName, newUrl);
}

function setPageWithConditions(normalizedUrl: string, customizedPageName: string, newUrl: string) {
  const hasTransitionDuration = transitionData.totalDuration !== undefined;

  if (!hasTransitionDuration) {
    queuePendingPageChange(newUrl, customizedPageName);
    return;
  }

  const sanitizedUrl = stripSecrets(normalizedUrl);
  const meta = { 'view.title': doc.title, 'view.url': sanitizedUrl };

  setPageTransitionData({ d: transitionData.totalDuration });
  if (DEBUG) info('PageChange:: Sending page change with duration:', transitionData.totalDuration);
  setPage(customizedPageName, meta);
  clearTransitionData();
}

function queuePendingPageChange(url: string, customizedPageName: string) {
  transitionData.pendingPageChange = { url, customizedPageName };
}

function clearTransitionData() {
  transitionData.totalDuration = undefined;
}

function applyCustomPageMappings(urlPath: string): string | null {
  const rules = getAutoPageDetectionMappingRule();
  const effectivePath = (titleAsPageNameInAutoPageDetection() ? doc.title : urlPath) || urlPath;
  if (!effectivePath || !rules.length) return effectivePath;

  for (const [pattern, replacement] of rules) {
    if (!pattern || !pattern.test(effectivePath)) continue;
    if (!replacement) return null;
    return effectivePath.replace(pattern, replacement);
  }
  return effectivePath;
}

function removeUrlOrigin(fullUrl: string) {
  try {
    const url = new URL(fullUrl);
    return `${url.pathname}${url.search}${url.hash}`;
  } catch (err) {
    // fallback to input string if it's not a valid full url
    if (DEBUG) {
      error('failed to remove origin from url', fullUrl, err);
    }
  }
  return fullUrl;
}

export function isAutoPageDetectionEnabled(): boolean {
  return !!vars.autoPageDetection;
}

export function ignorePopstateEvent(): boolean {
  return typeof vars.autoPageDetection === 'object' && !!vars.autoPageDetection?.ignorePopstateEvent;
}

export function titleAsPageNameInAutoPageDetection(): boolean {
  return typeof vars.autoPageDetection === 'object' && !!vars.autoPageDetection?.titleAsPageName;
}

function getAutoPageDetectionMappingRule(): Array<MappingRule> {
  if (typeof vars.autoPageDetection !== 'object' || !vars.autoPageDetection?.mappingRule) {
    return [];
  }
  return vars.autoPageDetection.mappingRule;
}

export function processAutoPageDetectionCommand(input: any): boolean | AutoPageDetectionType {
  const guessCmd = input as boolean | AutoPageDetectionType | null;
  if (!guessCmd) return false;

  if (typeof guessCmd !== 'object') return !!guessCmd;

  return {
    ignorePopstateEvent: guessCmd['ignorePopstateEvent'],
    titleAsPageName: guessCmd['titleAsPageName'],
    mappingRule: guessCmd['mappingRule']
  };
}

function processPendingPageTransition() {
  if (transitionData.transitionDuration !== undefined && transitionData.pendingPageChange) {
    calculateTotalTransitionTime();
  }
}
