// @flow

import {addTimingToPageLoadBeacon} from '../timings';
import type {State, PageLoadBeacon} from '../types';
import {addResourceTimings} from '../resources';
import {sendBeacon} from '../transmission';
import vars from '../vars';

const state: State = {
  onEnter() {
    // $FlowFixMe: Find a way to define all properties beforehand so that flow doesn't complain about missing props.
    const beacon: PageLoadBeacon = {};
    beacon['r'] = vars.referenceTimestamp;
    beacon['k'] = vars.apiKey;
    beacon['t'] = vars.pageLoadTraceId;
    beacon['bt'] = vars.pageLoadBackendTraceId;

    addMeta(beacon);
    addTimingToPageLoadBeacon(beacon);
    addResourceTimings(beacon);

    sendBeacon(beacon);
  }
};
export default state;

function addMeta(beacon: PageLoadBeacon) {
  const meta = vars.meta;
  let str = '';

  for (let key in meta) {
    if (meta.hasOwnProperty(key)) {
      const value = meta[key];
      if (value != null) {
        str += key + ',' + value;
      }
    }
  }

  beacon['m'] = str;
}
