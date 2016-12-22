// @flow

import {instrumentXMLHttpRequest} from '../instrumentations/XMLHttpRequest';
import {error, warn} from '../debug';
import type {State} from '../types';
import {transitionTo} from '../fsm';
import {win} from '../browser';
import vars from '../vars';

const state: State = {
  onEnter() {
    if (!fulfillsPrerequisites()) {
      if (DEBUG) {
        return warn('Browser does not have all the required features for web EUM.');
      }
    }

    const globalObjectName = win[vars.nameOfLongGlobal];
    const globalObject = win[globalObjectName];
    if (globalObject) {
      processQueue(globalObject.q);
    }

    if (typeof globalObject['l'] !== 'number') {
      if (DEBUG) {
        warn('Reference timestamp not set via EUM initializer. Was the initializer modified?');
      }
      return;
    }

    vars.initializerExecutionTimestamp = globalObject['l'];

    if (vars.reportingUrl) {
      instrumentXMLHttpRequest();
      transitionTo('waitForPageLoad');
    } else if (DEBUG) {
      error('No reporting URL configured. Aborting EUM initialization.');
    }
  },

  getActiveTraceId() {
    return null;
  }
};
export default state;


function processQueue(queue) {
  for (let i = 0, len = queue.length; i < len; i++) {
    const item = queue[i];

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
  return win.XMLHttpRequest && win.JSON;
}
