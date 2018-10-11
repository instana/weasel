// @flow

import {hookIntoGlobalUnhandledRejectionEvent} from '../hooks/unhandledRejection';
import {instrumentXMLHttpRequest} from '../hooks/XMLHttpRequest';
import {hookIntoGlobalErrorEvent} from '../hooks/unhandledError';
import type {State, EndSpaPageTransitionOpts} from '../types';
import {getPageLoadBackendTraceId} from '../serverTiming';
import {wrapEventHandlers} from '../hooks/eventHandlers';
import {instrumentFetch} from '../hooks/Fetch';
import {processCommand} from '../commands';
import {wrapTimers} from '../hooks/timers';
import {error, warn} from '../debug';
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

    if (!globalObject) {
      if (DEBUG) {
        warn('global ' + vars.nameOfLongGlobal + ' not found. Did you use the initializer?');
      }
      return;
    }

    if (!globalObject.q) {
      if (DEBUG) {
        warn('Command queue not defined. Did you add the tracking script multiple times to your website?');
      }
      return;
    }

    if (typeof globalObject['l'] !== 'number') {
      if (DEBUG) {
        warn('Reference timestamp not set via EUM initializer. Was the initializer modified?');
      }
      return;
    }

    processCommands(globalObject.q);

    // prefer the backend trace ID which was explicitly set
    vars.pageLoadBackendTraceId = vars.pageLoadBackendTraceId || getPageLoadBackendTraceId();
    vars.initializerExecutionTimestamp = globalObject['l'];

    addCommandAfterInitializationSupport();

    if (vars.reportingUrl) {
      instrumentXMLHttpRequest();
      instrumentFetch();
      hookIntoGlobalErrorEvent();
      wrapTimers();
      wrapEventHandlers();
      hookIntoGlobalUnhandledRejectionEvent();
      transitionTo('waitForPageLoad');
    } else if (DEBUG) {
      error('No reporting URL configured. Aborting EUM initialization.');
    }
  },

  getActiveTraceId() {
    return vars.pageLoadTraceId;
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
    return processCommand(arguments);
  };
}


function fulfillsPrerequisites() {
  return win.XMLHttpRequest && win.JSON;
}
