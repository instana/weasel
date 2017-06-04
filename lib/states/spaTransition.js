// @flow

import type {State, SpaBeacon, EndSpaPageTransitionOpts} from '../types';
import {now, generateUniqueId} from '../util';
import {addMetaDataToBeacon} from '../meta';
import {sendBeacon} from '../transmission';
import {transitionTo} from '../fsm';
import {warn} from '../debug';
import vars from '../vars';

let beacon: SpaBeacon;

const state: State = {
  onEnter() {
    // $FlowFixMe: Find a way to define all properties beforehand so that flow doesn't complain about missing props.
    beacon = {};
    beacon['k'] = vars.apiKey;
    beacon['t'] = generateUniqueId();
    beacon['ts'] = now();

    beacon['ty'] = 'spa';
    beacon['pl'] = vars.pageLoadTraceId;
  },

  getActiveTraceId(): string {
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

    switch (opts['status']) {
    case 'completed':
      beacon['r'] = 'c';
      break;
    case 'aborted':
      beacon['r'] = 'a';
      break;
    case 'error':
      beacon['r'] = 'e';
      break;
    default:
      if (DEBUG) {
        warn('Unsupported SPA transition result of type ' + opts['status']);
      }
      beacon['r'] = 'u';
      break;
    }

    addMetaDataToBeacon(beacon);
    sendBeacon(beacon);

    // TODO resource timings

    transitionTo('pageLoaded');
  }
};
export default state;
