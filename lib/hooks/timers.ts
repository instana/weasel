import {reportError, ignoreNextOnErrorEvent} from './unhandledError';
import {isRunningZoneJs} from '../timers';
import {win} from '../browser';
import {warn} from '../debug';
import vars from '../vars';

export function wrapTimers() {
  if (vars.wrapTimers) {
    if (isRunningZoneJs) {
      if (DEBUG) {
        warn(
          'We discovered a usage of Zone.js. In order to avoid any incompatibility issues timer wrapping is not going to be enabled.'
        );
      }
      return;
    }
    wrapTimer('setTimeout');
    wrapTimer('setInterval');
  }
}

function wrapTimer(name: 'setTimeout' | 'setInterval') {
  const original = win[name];
  if (typeof original !== 'function') {
    // cannot wrap because fn is not a function – should actually never happen
    return;
  }

  (win as any)[name] = function wrappedTimerSetter(fn: TimerHandler): ReturnType<(typeof win)[typeof name]> {
    // non-deopt arguments copy
    const args = new Array(arguments.length);
    for (let i = 0; i < arguments.length; i++) {
      // eslint-disable-next-line prefer-rest-params
      args[i] = arguments[i];
    }
    args[0] = wrap(fn);
    return original.apply(this, args as any);
  };
}

function wrap(fn: TimerHandler) {
  if (typeof fn !== 'function') {
    // cannot wrap because fn is not a function
    return fn;
  }

  return function wrappedTimerHandler(this: any) {
    try {
      // eslint-disable-next-line prefer-rest-params
      return fn.apply(this, arguments);
    } catch (e) {
      reportError(e as any);
      ignoreNextOnErrorEvent();
      throw e;
    }
  };
}
