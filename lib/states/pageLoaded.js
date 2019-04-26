// @flow

import {addCommonBeaconProperties} from '../commonBeaconProperties';
import {addResourceTimings} from '../resources/resources';
import {addTimingToPageLoadBeacon} from '../timings';
import {pageLoad as pageLoadPhase} from '../phases';
import type {State, PageLoadBeacon} from '../types';
import {sendBeacon} from '../transmission/index';
import {win} from '../browser';
import {warn} from '../debug';
import vars from '../vars';

let pageLoadBeaconTransmitted = false;

const state: State = {
  onEnter() {
    if (!pageLoadBeaconTransmitted) {
      pageLoadBeaconTransmitted = true;
      sendPageLoadBeacon();
    }
  },

  getActiveTraceId() {
    return null;
  },

  getActivePhase() {
    return undefined;
  },

  triggerManualPageLoad() {
    if (DEBUG) {
      warn('Page load triggered, but page is already considered as loaded. Did you mark it as loaded more than once?');
    }
  }
};
export default state;

function sendPageLoadBeacon() {
  // $FlowFixMe: Find a way to define all properties beforehand so that flow doesn't complain about missing props.
  const beacon: PageLoadBeacon = {
    'ty': 'pl'
  };
  addCommonBeaconProperties(beacon);

  beacon['t'] = vars.pageLoadTraceId;
  beacon['bt'] = vars.pageLoadBackendTraceId;
  beacon['u'] = win.location.href;
  beacon['ph'] = pageLoadPhase;

  addTimingToPageLoadBeacon(beacon);
  addResourceTimings(beacon);

  sendBeacon(beacon);
}
