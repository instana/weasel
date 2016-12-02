// @flow

import {info} from './debug';

var states: {[name: string]: EumState} = {};
var currentStateName;

export function registerState(name: string, impl: EumState) {
  states[name] = impl;
}

export function transitionTo(nextStateName: string) {
  if (DEBUG) {
    info('Transitioning from %s to %s', currentStateName || '<no state>', nextStateName);
  }

  currentStateName = nextStateName;
  states[nextStateName].onEnter();
}
