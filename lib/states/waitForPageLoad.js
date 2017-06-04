// @flow

import type {State, EndSpaPageTransitionOpts} from '../types';
import onLoadEvent from '../events/onLoad';
import {transitionTo} from '../fsm';
import {on} from '../eventBus';
import {warn} from '../debug';
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

  triggerManualPageLoad: onLoad,

  startSpaPageTransition(): void {
    if (DEBUG) {
      warn('Cannot start an SPA page transition until the page is considered loaded.');
    }
  },

  /* eslint-disable no-unused-vars */
  endSpaPageTransition(opts: EndSpaPageTransitionOpts): void {
  /* eslint-enable no-unused-vars */
    if (DEBUG) {
      warn('No pending SPA page transition to end. Waiting for page load instead.');
    }
  }
};
export default state;

function onLoad() {
  transitionTo('pageLoaded');
}
