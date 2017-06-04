// @flow

import {transitionTo, triggerManualPageLoad, startSpaTransition, endSpaTransition} from '../fsm';
import {instrumentXMLHttpRequest} from '../hooks/XMLHttpRequest';
import {hookIntoGlobalErrorEvent} from '../hooks/unhandledError';
import type {State, EndSpaPageTransitionOpts} from '../types';
import {error, warn} from '../debug';
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
      processCommands(globalObject.q);
    }

    if (typeof globalObject['l'] !== 'number') {
      if (DEBUG) {
        warn('Reference timestamp not set via EUM initializer. Was the initializer modified?');
      }
      return;
    }

    vars.initializerExecutionTimestamp = globalObject['l'];

    addCommandAfterInitializationSupport();

    if (vars.reportingUrl) {
      instrumentXMLHttpRequest();
      hookIntoGlobalErrorEvent();
      transitionTo('waitForPageLoad');
    } else if (DEBUG) {
      error('No reporting URL configured. Aborting EUM initialization.');
    }
  },

  getActiveTraceId() {
    return null;
  },

  triggerManualPageLoad() {
    if (DEBUG) {
      warn('Triggering a page load while EUM is initializing is unsupported.');
    }
  },

  startSpaPageTransition(): void {
    if (DEBUG) {
      warn('Triggering an SPA page transition is unsupported while EUM is initializing.');
    }
  },

  /* eslint-disable no-unused-vars */
  endSpaPageTransition(opts: EndSpaPageTransitionOpts): void {
  /* eslint-enable no-unused-vars */
    if (DEBUG) {
      warn('SPA page transitions are unsupported while EUM is initializing.');
    }
  }
};
export default state;


function processCommands(commands) {
  for (let i = 0, len = commands.length; i < len; i++) {
    processCommand(commands[i]);
  }
}


function addCommandAfterInitializationSupport() {
  const globalObjectName = win[vars.nameOfLongGlobal];
  win[globalObjectName] = function() {
    processCommand(arguments);
  };
}


function processCommand(command) {
  switch (command[0]) {
  case 'apiKey':
    vars.apiKey = command[1];
    break;
  case 'reportingUrl':
    vars.reportingUrl = command[1];
    break;
  case 'meta':
    vars.meta[command[1]] = command[2];
    break;
  case 'traceId':
    vars.pageLoadBackendTraceId = command[1];
    break;
  case 'ignoreUrls':
    if (DEBUG) {
      validateIgnoreUrls(command[1]);
    }
    vars.ignoreUrls = command[1];
    break;
  case 'manualPageLoadEvent':
    vars.manualPageLoadEvent = true;
    break;
  case 'triggerPageLoad':
    vars.manualPageLoadTriggered = true;
    triggerManualPageLoad();
    break;
  case 'xhrTransmissionTimeout':
    vars.xhrTransmissionTimeout = command[1];
    break;
  case 'startSpaPageTransition':
    startSpaTransition();
    break;
  case 'endSpaPageTransition':
    endSpaTransition(command[1]);
    break;
  }
}


function fulfillsPrerequisites() {
  return win.XMLHttpRequest && win.JSON;
}


function validateIgnoreUrls(ignoreUrls) {
  if (!(ignoreUrls instanceof Array)) {
    return warn('ignoreUrls is not an array. This will result in errors.');
  }

  for (let i = 0, len = ignoreUrls.length; i < len; i++) {
    if (!(ignoreUrls[i] instanceof RegExp)) {
      return warn('ignoreUrls[' + i + '] is not a RegExp. This will result in errors.');
    }
  }
}
