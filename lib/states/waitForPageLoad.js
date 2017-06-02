// @flow

import onLoadEvent from '../events/onLoad';
import {transitionTo} from '../fsm';
import type {State} from '../types';
import {on} from '../eventBus';
import vars from '../vars';

const state: State = {
  onEnter() {
    if (!vars.manualPageLoadEvent) {
      on(onLoadEvent.name, onLoad);
      onLoadEvent.initialize();
    }
  },

  getActiveTraceId() {
    return vars.pageLoadTraceId;
  },

  triggerManualPageLoad: onLoad
};
export default state;

function onLoad() {
  transitionTo('pageLoaded');
}
