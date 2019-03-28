// @flow

import {pageLoad as pageLoadPhase} from '../phases';
import onLoadEvent from '../events/onLoad';
import type {State} from '../types';
import {transitionTo} from '../fsm';
import {on} from '../eventBus';
import vars from '../vars';

const state: State = {
  onEnter() {
    if (!vars.manualPageLoadEvent || vars.manualPageLoadTriggered) {
      on(onLoadEvent.name, onLoad);
      onLoadEvent.initialize();
    }
  },

  getActiveTraceId() {
    return vars.pageLoadTraceId;
  },

  getActivePhase() {
    return pageLoadPhase;
  },

  triggerManualPageLoad: onLoad
};
export default state;

function onLoad() {
  transitionTo('pageLoaded');
}
