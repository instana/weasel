// @flow

import {reportError, ignoreNextOnErrorEvent} from './unhandledError';
import {win} from '../browser';
import vars from '../vars';

export function wrapTimers() {
  if (vars.wrapTimers) {
    wrapTimer('setTimeout');
    wrapTimer('setInterval');
  }
}

function wrapTimer(name) {
  const original = win[name];
  if (typeof original !== 'function') {
    // cannot wrap because fn is not a function – should actually never happen
    return;
  }

  win[name] = function wrappedTimerSetter(fn) {
    // non-deopt arguments copy
    const args = new Array(arguments.length);
    for (let i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }
    args[0] = wrap(fn);
    return original.apply(this, args);
  };
}

function wrap(fn) {
  if (typeof fn !== 'function') {
    // cannot wrap because fn is not a function
    return fn;
  }

  return function wrappedTimerHandler() {
    try {
      return fn.apply(this, arguments);
    } catch (e) {
      reportError(e);
      ignoreNextOnErrorEvent();
      throw e;
    }
  };
}
