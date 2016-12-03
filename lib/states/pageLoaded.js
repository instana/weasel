// @flow

import {addTimingToPageLoadBeacon, isTimingAvailable} from '../timings';
import {sendBeacon} from '../transmission';
import type {State} from '../types';
import vars from '../vars';

const state: State = {
  onEnter() {
    const beacon = {
      'r': vars.referenceTimestamp,
      'k': vars.apiKey,
      't': vars.pageLoadTraceId,
      'bt': vars.pageLoadBackendTraceId
    };
    addMeta(beacon);
    addTimingToPageLoadBeacon(beacon);

    if (!isTimingAvailable) {
      beacon['timing'] = '0';
    }

    sendBeacon(beacon);
  }
};
export default state;

function addMeta(beacon) {
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

  beacon['meta'] = str;
}
