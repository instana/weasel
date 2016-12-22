// @flow

import onLoadEvent from '../events/onLoad';
import {transitionTo} from '../fsm';
import type {State} from '../types';
import {on} from '../eventBus';
import vars from '../vars';

const state: State = {
  onEnter() {
    on(onLoadEvent.name, onLoad);
    onLoadEvent.initialize();
  },

  getActiveTraceId() {
    return vars.pageLoadTraceId;
  }
};
export default state;

function onLoad() {
  transitionTo('pageLoaded');
}
