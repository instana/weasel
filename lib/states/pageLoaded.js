// @flow

import {addTimingToPageLoadBeacon, isTimingAvailable} from '../timings';
import type {State, BeaconData} from '../types';
import {sendBeacon} from '../transmission';
import vars from '../vars';

const state: State = {
  onEnter() {
    const beacon: BeaconData = {
      'r': vars.referenceTimestamp,
      'k': vars.apiKey,
      't': vars.pageLoadTraceId,
      'bt': vars.pageLoadBackendTraceId
    };
    addMeta(beacon);
    addTimingToPageLoadBeacon(beacon);

    // We add this as an extra property to the beacon so that
    // a backend can decide whether it should include timing
    // information in aggregated metrics. Since they are only
    // approximations, this is not always desirable.
    if (!isTimingAvailable) {
      beacon['timing'] = '0';
    }

    sendBeacon(beacon);
  }
};
export default state;

function addMeta(beacon: BeaconData) {
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
