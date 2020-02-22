// @flow

import {hookIntoGlobalUnhandledRejectionEvent} from '../hooks/unhandledRejection';
import {instrumentXMLHttpRequest} from '../hooks/XMLHttpRequest';
import {hookIntoGlobalErrorEvent} from '../hooks/unhandledError';
import {getPageLoadBackendTraceId} from '../serverTiming';
import {wrapEventHandlers} from '../hooks/eventHandlers';
import {pageLoad as pageLoadPhase} from '../phases';
import {instrumentFetch} from '../hooks/Fetch';
import {processCommand} from '../commands';
import {wrapTimers} from '../hooks/timers';
import {error, warn} from '../debug';
import {transitionTo} from '../fsm';
import type {State} from '../types';
import {win} from '../browser';
import vars from '../vars';

const state: State = {
  onEnter() {
    if (DEBUG && !fulfillsPrerequisites()) {
      warn('Browser does not have all the required features for web monitoring.');
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

    if (!vars.reportingUrl) {
      if (DEBUG) {
        error('No reporting URL configured. Aborting EUM initialization.');
      }
      return;
    }

    instrumentXMLHttpRequest();
    instrumentFetch();
    hookIntoGlobalErrorEvent();
    wrapTimers();
    wrapEventHandlers();
    hookIntoGlobalUnhandledRejectionEvent();
    transitionTo('waitForPageLoad');
  },

  getActiveTraceId() {
    return vars.pageLoadTraceId;
  },

  getActivePhase() {
    return pageLoadPhase;
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
