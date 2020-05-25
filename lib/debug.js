/* eslint-disable no-console */

// @flow

import {noop} from './util';

type Logger = (...any) => void;

// $FlowFixMe The function is never going to be used when it is a bool
export const log: Logger = DEBUG && createLogger('log');
// $FlowFixMe The function is never going to be used when it is a bool
export const info: Logger = DEBUG && createLogger('info');
// $FlowFixMe The function is never going to be used when it is a bool
export const warn: Logger = DEBUG && createLogger('warn');
// $FlowFixMe The function is never going to be used when it is a bool
export const error: Logger = DEBUG && createLogger('error');
// $FlowFixMe The function is never going to be used when it is a bool
export const debug: Logger = DEBUG && createLogger('debug');

function createLogger(method): (...any) => void {
  if (typeof console === 'undefined' || typeof console.log !== 'function' || typeof console.log.apply !== 'function') {
    return noop;
  }

  if (console[method] && typeof console[method].apply === 'function') {
    return function() {
      console[method].apply(console, arguments);
    };
  }

  return function() {
    console.log.apply(console, arguments);
  };
}
