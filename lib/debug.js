/* eslint-disable no-console */

// @flow

import {noop} from './util';

export const log = createLogger('log');
export const info = createLogger('info');
export const warn = createLogger('warn');
export const error = createLogger('error');
export const debug = createLogger('debug');

function createLogger(method) {
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
