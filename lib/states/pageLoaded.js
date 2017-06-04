// @flow

import type {State, PageLoadBeacon, EndSpaPageTransitionOpts} from '../types';
import {addTimingToPageLoadBeacon} from '../timings';
import {addResourceTimings} from '../resources';
import {addMetaDataToBeacon} from '../meta';
import {sendBeacon} from '../transmission';
import {transitionTo} from '../fsm';
import {win} from '../browser';
import {warn} from '../debug';
import vars from '../vars';

const state: State = {
  onEnter() {
    // $FlowFixMe: Find a way to define all properties beforehand so that flow doesn't complain about missing props.
    const beacon: PageLoadBeacon = {};
    beacon['ty'] = 'pl';
    beacon['r'] = vars.referenceTimestamp;
    beacon['k'] = vars.apiKey;
    beacon['t'] = vars.pageLoadTraceId;
    beacon['bt'] = vars.pageLoadBackendTraceId;
    beacon['u'] = win.location.href;

    addMetaDataToBeacon(beacon);
    addTimingToPageLoadBeacon(beacon);
    addResourceTimings(beacon);

    sendBeacon(beacon);
  },

  getActiveTraceId() {
    return null;
  },

  triggerManualPageLoad() {
    if (DEBUG) {
      warn('Page load triggered, but page is already considered as loaded. Did you mark it as loaded more than once?');
    }
  },

  startSpaPageTransition(): void {
    transitionTo('spaTransition');
  },

  /* eslint-disable no-unused-vars */
  endSpaPageTransition(opts: EndSpaPageTransitionOpts): void {
  /* eslint-enable no-unused-vars */
    if (DEBUG) {
      warn('No pending SPA page transition to end.');
    }
  }
};
export default state;
