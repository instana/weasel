// @flow

import {addCommonBeaconProperties} from '../commonBeaconProperties';
import {addResourceTimings} from '../resources/resources';
import {addTimingToPageLoadBeacon} from '../timings';
import {pageLoad as pageLoadPhase} from '../phases';
import type {State, PageLoadBeacon} from '../types';
import {onLastChance} from '../events/onLastChance';
import {sendBeacon} from '../transmission/index';
import {setTimeout} from '../timers';
import {stripSecrets} from '../stripSecrets';
import {win, doc} from '../browser';
import {info} from '../debug';
import vars from '../vars';

// Export
// $FlowFixMe: Find a way to define all properties beforehand so that flow doesn't complain about missing props.
export const beacon: Partial<PageLoadBeacon> = {
  'ty': 'pl'
};

const state: State = {
  onEnter() {
    addCommonBeaconProperties(beacon);

    beacon['t'] = vars.pageLoadTraceId;
    beacon['bt'] = vars.pageLoadBackendTraceId;
    beacon['u'] = stripSecrets(win.location.href);
    beacon['ph'] = pageLoadPhase;

    addTimingToPageLoadBeacon(beacon);
    addResourceTimings(beacon);

    let beaconSent = false;
    if (doc.visibilityState !== 'visible') {
      if (DEBUG) {
        info('Will not wait for additional page load beacon data because document.visibilityState is', doc.visibilityState);
      }
      sendPageLoadBeacon();
      return;
    }

    setTimeout(sendPageLoadBeacon, vars.maxMaitForPageLoadMetricsMillis);
    onLastChance(sendPageLoadBeacon);

    function sendPageLoadBeacon() {
      if (!beaconSent) {
        beaconSent = true;
        sendBeacon(beacon);
      }
    }
  },

  getActiveTraceId() {
    return null;
  },

  getActivePhase() {
    return undefined;
  }
};
export default state;

