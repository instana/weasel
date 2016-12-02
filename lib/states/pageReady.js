import {sendBeacon} from '../transmission';
import type {State} from '../types';
import vars from '../vars';

const state: State = {
  onEnter() {
    sendBeacon({
      'r': vars.referenceTimestamp,
      'pr': vars.pageReadyEvent.time - vars.referenceTimestamp
    });
  }
};
export default state;
