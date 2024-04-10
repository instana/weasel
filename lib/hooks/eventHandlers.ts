// @flow

import { addWrappedDomEventListener, popWrappedDomEventListener } from '../asyncFunctionWrapping';
import type { EventListenerOptionsOrUseCapture } from '../asyncFunctionWrapping';
import { reportError, ignoreNextOnErrorEvent } from './unhandledError';
import { win } from '../browser';
import vars from '../vars';

export function wrapEventHandlers() {
  if (vars.wrapEventHandlers) {
    wrapEventTarget(win.EventTarget);
  }
}

function wrapEventTarget(EventTarget) {
  if (
    !EventTarget ||
    typeof EventTarget.prototype.addEventListener !== 'function' ||
    typeof EventTarget.prototype.removeEventListener !== 'function'
  ) {
    return;
  }

  const originalAddEventListener = EventTarget.prototype.addEventListener;
  const originalRemoveEventListener = EventTarget.prototype.removeEventListener;

  EventTarget.prototype.addEventListener = function wrappedAddEventListener(
    eventName: string,
    fn: Function,
    optionsOrCapture?: EventListenerOptionsOrUseCapture
  ) {
    if (typeof fn !== 'function') {
      return originalAddEventListener.apply(this, arguments);
    }

    // non-deopt arguments copy
    const args = new Array(arguments.length);
    for (let i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }

    args[1] = function wrappedEventListener() {
      try {
        return fn.apply(this, arguments);
      } catch (e) {
        reportError(e);
        ignoreNextOnErrorEvent();
        throw e;
      }
    };

    args[1] = addWrappedDomEventListener(this, args[1], eventName, fn, optionsOrCapture);

    return originalAddEventListener.apply(this, args);
  };

  EventTarget.prototype.removeEventListener = function wrappedRemoveEventListener(
    eventName: string,
    fn: Function,
    optionsOrCapture?: EventListenerOptionsOrUseCapture
  ) {
    if (typeof fn !== 'function') {
      return originalRemoveEventListener.apply(this, arguments);
    }

    // non-deopt arguments copy
    const args = new Array(arguments.length);
    for (let i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }

    args[1] = popWrappedDomEventListener(this, eventName, fn, optionsOrCapture, fn);

    return originalRemoveEventListener.apply(this, args);
  };
}
