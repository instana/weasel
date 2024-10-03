import {win, doc} from '../browser';
import type {AutoPageDetectionType, MappingRule} from '../types';
import vars from '../vars';
import {info, debug, error} from '../debug';
import {setPage} from '../pageChange';
import shimmer from 'shimmer';
import {isWrapped} from '../utilWrap';
import {normalizeUrl} from './normalizeUrl';
import {stripSecrets} from '../stripSecrets';
import {getActivePhase} from '../fsm';

export function configAutoPageDetection() {
  resetPageDetectionState();

  if (!isAutoPageDetectionEnabled()) {
    return;
  }

  wrapHistoryMethods();

  win.addEventListener('hashchange', hashChangeEventListener);
  isHashChangeListenerAdded = true;

  if (!ignorePopstateEvent()) {
    if (DEBUG) {
      info('handlePossibleUrlChange on popstate event received');
    }
    win.addEventListener('popstate', popStateEventListener);
    isPopstateEventListenerAdded = true;
  }
  if (getActivePhase() === 'pl') {
    handlePossibleUrlChange(window.location.pathname);
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
  if (DEBUG) {
    info(`hashchange to ${event.newURL} from ${event.oldURL}, current location ${win.location}`);
  }
  handlePossibleUrlChange(event.newURL);
}

function popStateEventListener(_event: PopStateEvent) {
  if (DEBUG) {
    info(`popstate current location ${win.location}`);
  }
  handlePossibleUrlChange(window.location.pathname);
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
    if (DEBUG) {
      info('unwrap history.replaceState');
    }
    shimmer.unwrap(history, 'replaceState');
  }
  if (isWrapped(win.history.pushState)) {
    if (DEBUG) {
      info('unwrap history.pushState');
    }
    shimmer.unwrap(history, 'pushState');
  }
}

function _patchHistoryMethod(methodName: string) {
  return (original: any) => {
    if (DEBUG) {
      info(`patching history ${methodName}`);
    }
    return function patchHistoryMethod(this: History, ...args: unknown[]) {
      if (DEBUG) {
        debug(`history ${methodName} invoked with`, args);
      }
      updateLocation(args);
      return original.apply(this, args);
    };
  };
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
  const normalizedUrl = normalizeUrl(newUrl, true);
  const customizedPageName = applyCustomPageMappings(removeUrlOrigin(normalizedUrl));
  if (!customizedPageName) {
    return;
  }

  setPage(customizedPageName, {
    'view.title': doc.title,
    'view.url': stripSecrets(normalizedUrl)
  });
}

function applyCustomPageMappings(urlPath: string): string | null {
  const rules = getAutoPageDetectionMappingRule();
  const effectivePath = (titleAsPageNameInAutoPageDetection() ? doc.title : urlPath) || urlPath;
  if (!effectivePath || !rules.length) {
    return effectivePath;
  }

  for (const [pattern, replacement] of rules) {
    if (!pattern || !pattern.test(effectivePath)) {
      continue;
    }
    if (!replacement) {
      return null;
    }
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
  if (!guessCmd) {
    return false;
  }

  if (typeof guessCmd !== 'object') {
    return !!guessCmd;
  }

  return {
    ignorePopstateEvent: guessCmd['ignorePopstateEvent'],
    titleAsPageName: guessCmd['titleAsPageName'],
    mappingRule: guessCmd['mappingRule']
  };
}
