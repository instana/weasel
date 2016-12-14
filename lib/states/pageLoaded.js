// @flow

import {addTimingToPageLoadBeacon} from '../timings';
import type {State, PageLoadBeacon} from '../types';
import {addResourceTimings} from '../resources';
import {sendBeacon} from '../transmission';
import {hasOwnProperty} from '../util';
import vars from '../vars';

const state: State = {
  onEnter() {
    // $FlowFixMe: Find a way to define all properties beforehand so that flow doesn't complain about missing props.
    const beacon: PageLoadBeacon = {};
    beacon['r'] = vars.referenceTimestamp;
    beacon['k'] = vars.apiKey;
    beacon['t'] = vars.pageLoadTraceId;
    beacon['bt'] = vars.pageLoadBackendTraceId;

    addMetaDataToBeacon(beacon);
    addTimingToPageLoadBeacon(beacon);
    addResourceTimings(beacon);

    sendBeacon(beacon);
  }
};
export default state;


function addMetaDataToBeacon(beacon: PageLoadBeacon) {
  for (let key in vars.meta) {
    if (hasOwnProperty(vars.meta, key)) {
      beacon['m_' + key] = vars.meta[key];
    }
  }
}
