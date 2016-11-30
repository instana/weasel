/* eslint-disable no-console */

// @flow

import {noop} from './util';

export var log = createLogger('log');
export var info = createLogger('info');
export var warn = createLogger('warn');
export var error = createLogger('error');
export var debug = createLogger('debug');

function createLogger(method) {
  if (typeof console === 'undefined') {
    return noop;
  } else if (!console[method]) {
    return console.log.bind(console);
  }

  return console[method].bind(console);
}
