// @flow

import vars from './vars';

// Copied from flow's DOM type definition at:
// https://github.com/facebook/flow/blob/master/lib/dom.js
export type EventListenerOptionsOrUseCapture =
  | boolean
  | {
      capture?: boolean
    };

// Asynchronous function wrapping: The process of wrapping a listener which goes into one function, e.g.
//
//  - EventTarget#addEventListener
//  - EventEmitter#on
//
// and is removed via another function, e.g.
//
//  - EventTarget#removeEventListener
//  - EventEmitter#off
//
// What is complicated about this, is that these methods identify registered listeners by function reference.
// When we wrap a function, we naturally change the reference. We must therefore keep track of which
// original function belongs to what wrapped function.
//
// This file provides helpers that help in the typical cases. It is removed from all browser specific APIs
// in order to allow simple unit test execution.
//
// Note that this file follows the behavior outlined in DOM specification. Among others, this means that it is not
// possible to register the same listener twice.
// http://dom.spec.whatwg.org

export function addWrappedFunction(
  storageTarget: EventTarget,
  wrappedFunction: EventListenerOrEventListenerObject,
  valuesForEqualityCheck: any[]
): EventListenerOrEventListenerObject {
  const storage = ((storageTarget as any)[vars.wrappedEventHandlersOriginalFunctionStorageKey] =
    (storageTarget as any)[vars.wrappedEventHandlersOriginalFunctionStorageKey] || []);
  const index = findInStorage(storageTarget, valuesForEqualityCheck);
  if (index !== -1) {
    // already registered. Do not allow re-registration
    return storage[index].wrappedFunction;
  }

  storage.push({
    wrappedFunction,
    valuesForEqualityCheck
  });
  return wrappedFunction;
}

function findInStorage(storageTarget: EventTarget, valuesForEqualityCheck: any[]): number {
  const storage = (storageTarget as any)[vars.wrappedEventHandlersOriginalFunctionStorageKey];
  for (let i = 0; i < storage.length; i++) {
    const storageItem = storage[i];

    if (matchesEqualityCheck(storageItem?.valuesForEqualityCheck, valuesForEqualityCheck)) {
      return i;
    }
  }
  return -1;
}

export function popWrappedFunction(storageTarget: EventTarget, valuesForEqualityCheck: any[], fallback?: EventListenerOrEventListenerObject): EventListenerOrEventListenerObject | undefined {
  const storage = (storageTarget as any)[vars.wrappedEventHandlersOriginalFunctionStorageKey];
  if (storage == null) {
    return fallback;
  }

  const index = findInStorage(storageTarget, valuesForEqualityCheck);
  if (index === -1) {
    return fallback;
  }

  const storageItem = storage[index];
  storage.splice(index, 1);
  return storageItem.wrappedFunction;
}

function matchesEqualityCheck(valuesForEqualityCheckA: any, valuesForEqualityCheckB: any) {
  if (valuesForEqualityCheckA.length !== valuesForEqualityCheckB.length) {
    return false;
  }

  for (let i = 0; i < valuesForEqualityCheckA.length; i++) {
    if (valuesForEqualityCheckA[i] !== valuesForEqualityCheckB[i]) {
      return false;
    }
  }

  return true;
}

export function addWrappedDomEventListener(
  storageTarget: EventTarget,
  wrappedFunction: EventListenerOrEventListenerObject,
  eventName: string,
  eventListener: EventListenerOrEventListenerObject,
  optionsOrCapture?: EventListenerOptionsOrUseCapture
): EventListenerOrEventListenerObject {
  return addWrappedFunction(
    storageTarget,
    wrappedFunction,
    getDomEventListenerValuesForEqualityCheck(eventName, eventListener, optionsOrCapture)
  );
}

function getDomEventListenerValuesForEqualityCheck(
  eventName: string,
  eventListener: EventListenerOrEventListenerObject,
  optionsOrCapture?: EventListenerOptionsOrUseCapture
): any[] {
  return [eventName, eventListener, getDomEventListenerCaptureValue(optionsOrCapture)];
}

export function getDomEventListenerCaptureValue(optionsOrCapture?: EventListenerOptionsOrUseCapture): boolean {
  // > Let capture, passive, and once be the result of flattening more options.
  // https://dom.spec.whatwg.org/#dom-eventtarget-addeventlistener
  //
  // > To flatten more options, run these steps:
  // > 1. Let capture be the result of flattening options.
  // https://dom.spec.whatwg.org/#event-flatten-more
  //
  // > To flatten options, run these steps:
  // > 1. If options is a boolean, then return options.
  // > 2. Return options’s capture.
  // https://dom.spec.whatwg.org/#concept-flatten-options
  //
  // > dictionary EventListenerOptions {
  // >   boolean capture = false;
  // > };
  // https://dom.spec.whatwg.org/#dom-eventlisteneroptions-capture
  if (optionsOrCapture == null) {
    return false;
  } else if (typeof optionsOrCapture === 'object') {
    return Boolean(optionsOrCapture.capture);
  }
  return Boolean(optionsOrCapture);
}

export function popWrappedDomEventListener(
  storageTarget: EventTarget,
  eventName: string,
  eventListener: EventListenerOrEventListenerObject,
  optionsOrCapture?: EventListenerOptionsOrUseCapture,
  fallback?: EventListenerOrEventListenerObject
): EventListenerOrEventListenerObject | undefined {
  return popWrappedFunction(
    storageTarget,
    getDomEventListenerValuesForEqualityCheck(eventName, eventListener, optionsOrCapture),
    fallback
  );
}
