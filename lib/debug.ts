/* eslint-disable no-console */

// @flow

import {noop} from './util';

type Logger = (...args: any[]) => void;

export const log: Logger = DEBUG ? createLogger('log') : noop;
export const info: Logger = DEBUG ? createLogger('info') : noop;
export const warn: Logger = DEBUG ? createLogger('warn') : noop;
export const error: Logger = DEBUG ? createLogger('error') : noop;
export const debug: Logger = DEBUG ? createLogger('debug') : noop;

function createLogger(method: Extract<keyof Console, 'log' | 'info' | 'warn' | 'error' | 'debug'>): Logger {
  if (typeof console === 'undefined' || typeof console.log !== 'function' || typeof console.log.apply !== 'function') {
    return noop;
  }

  if (console[method] && typeof console[method].apply === 'function') {
    return function() {
      console[method].apply(console, arguments as any);
    };
  }

  return function() {
    console.log.apply(console, arguments as any);
  };
}
