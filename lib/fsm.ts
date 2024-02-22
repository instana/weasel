// @flow

import type {State} from './types';
import {info} from './debug';

const states: {[name: string]: State} = {};
let currentStateName: string | null;

export function registerState(name: string, impl: State) {
  states[name] = impl;
}

export function transitionTo(nextStateName: string) {
  if (DEBUG) {
    info('Transitioning from %s to %s', currentStateName || '<no state>', nextStateName);
  }

  currentStateName = nextStateName;
  states[nextStateName].onEnter();
}

export function getActiveTraceId(): string | null | undefined {
  return currentStateName ? states[currentStateName].getActiveTraceId() : null;
}

export function getActivePhase(): string | null | undefined {
  return currentStateName ? states[currentStateName].getActivePhase() : null;
}
