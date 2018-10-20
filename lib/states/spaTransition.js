// @flow

import type {State, SpaBeacon, EndSpaPageTransitionOpts} from '../types';
import {addCommonBeaconProperties} from '../commonBeaconProperties';
import {addResourceTimings} from '../resources';
import {now, generateUniqueId} from '../util';
import {sendBeacon} from '../transmission';
import {transitionTo} from '../fsm';
import {warn} from '../debug';

// We are never recreating this beacon object since we are always reporting / rewriting all properties.
// $FlowFixMe: Find a way to define all properties beforehand so that flow doesn't complain about missing props.
let beacon: SpaBeacon = {};

const state: State = {
  onEnter() {
    beacon['t'] = generateUniqueId();
    beacon['ts'] = now();
    beacon['ty'] = 'spa';
  },

  getActiveTraceId(): string {
    // $FlowFixMe: Flow somehow considers this property as null|number|undefined.
    return beacon['t'];
  },

  triggerManualPageLoad() {
    if (DEBUG) {
      warn('Triggering a page load while SPA transitioning is unsupported.');
    }
  },

  startSpaPageTransition(): void {
    if (DEBUG) {
      warn('Triggering an SPA page transition while already transitioning is unsupported.');
    }

    // best effort here even though it is wrong usage
    transitionTo('spaTransition');
  },

  endSpaPageTransition(opts: EndSpaPageTransitionOpts): void {
    beacon['l'] = opts['url'];
    beacon['e'] = opts['explanation'];
    // $FlowFixMe: Flow somehow considers the ts property to be a string
    beacon['d'] = now() - beacon['ts'];

    switch (opts['status']) {
    case 'completed':
      beacon['s'] = 'c';
      break;
    case 'aborted':
      beacon['s'] = 'a';
      break;
    case 'error':
      beacon['s'] = 'e';
      break;
    default:
      if (DEBUG) {
        warn('Unsupported SPA transition status of type ' + opts['status']);
      }
      beacon['s'] = 'u';
      break;
    }

    addCommonBeaconProperties(beacon);
    // $FlowFixMe: Flow somehow considers the ts property to be a string
    addResourceTimings(beacon, beacon['ts'] - 1);
    sendBeacon(beacon);
    transitionTo('pageLoaded');
  }
};
export default state;
