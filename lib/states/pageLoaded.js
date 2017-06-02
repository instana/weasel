// @flow

import {addTimingToPageLoadBeacon} from '../timings';
import type {State, PageLoadBeacon} from '../types';
import {addResourceTimings} from '../resources';
import {addMetaDataToBeacon} from '../meta';
import {sendBeacon} from '../transmission';
import {win} from '../browser';
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

  triggerManualPageLoad() {}
};
export default state;
