import {error, warn} from '../debug';
import type {State} from '../types';
import {transitionTo} from '../fsm';
import vars from '../vars';

const state: State = {
  onEnter() {
    if (!fulfillsPrerequisites()) {
      if (DEBUG) {
        return warn('Browser does not have all the required features for web EUM.');
      }
    }
    var globalObjectName = window[vars.nameOfLongGlobal];
    var globalObject = window[globalObjectName];
    if (globalObject) {
      processQueue(globalObject.q);
    }

    if (vars.reportingUrl) {
      transitionTo('waitForPageReady');
    } else if (DEBUG) {
      error('No reporting URL configured. Aborting EUM initialization.');
    }
  }
};
export default state;


function processQueue(queue) {
  for (var i = 0, len = queue.length; i < len; i++) {
    var item = queue[i];

    switch (item[0]) {
    case 'apiKey':
      vars.apiKey = item[1];
      break;
    case 'reportingUrl':
      vars.reportingUrl = item[1];
      break;
    case 'meta':
      vars.meta[item[1]] = item[2];
      break;
    case 'traceId':
      vars.pageLoadBackendTraceId = item[1];
      break;
    default:
      continue;
    }
  }
}


function fulfillsPrerequisites() {
  return window.XMLHttpRequest != null;
}
