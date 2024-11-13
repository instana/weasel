import {hookIntoGlobalUnhandledRejectionEvent} from '../hooks/unhandledRejection';
import {instrumentXMLHttpRequest} from '../hooks/XMLHttpRequest';
import {hookIntoGlobalErrorEvent} from '../hooks/unhandledError';
import {getPageLoadBackendTraceId} from '../serverTiming';
import {wrapEventHandlers} from '../hooks/eventHandlers';
import {hookIntoUserTimings} from '../hooks/userTiming';
import {beacon as pageLoadBeacon} from './pageLoaded';
import {pageLoad as pageLoadPhase} from '../phases';
import {instrumentFetch} from '../hooks/Fetch';
import {processCommand} from '../commands';
import {wrapTimers} from '../hooks/timers';
import {error, warn, info} from '../debug';
import {addWebVitals} from '../webVitals';
import {transitionTo} from '../fsm';
import type {State} from '../types';
import {win} from '../browser';
import vars from '../vars';
import {configAutoPageDetection} from '../hooks/autoPageDetection';

export let sriIntegrity: boolean;

const state: State = {
  onEnter() {
    if (DEBUG && !fulfillsPrerequisites()) {
      warn('Browser does not have all the required features for web monitoring.');
    }

    const globalObjectName = (win as any)[vars.nameOfLongGlobal];
    const globalObject: {
      (...args: Array<any>): void;
      q: Array<any>;
      v: number;
      l: number;
    } = win[globalObjectName] as any;

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

    if (typeof globalObject['v'] === 'number') {
      const version = String(Math.round(globalObject['v']));
      if (DEBUG) {
        info('Identified version of snippet to be:', version);
      }
      vars.trackingSnippetVersion = version;
    }

    // Start observing web vitals as early as possible as it registers performance observers.
    try {
      addWebVitals(pageLoadBeacon);
    } catch (e) {
      if (DEBUG) {
        warn('Failed to capture web vitals. Will continue without web vitals', e);
      }
    }
    processCommands(globalObject.q);
    checkforSriIntegrity();

    // prefer the backend trace ID which was explicitly set
    vars.pageLoadBackendTraceId = vars.pageLoadBackendTraceId || getPageLoadBackendTraceId();
    vars.initializerExecutionTimestamp = globalObject['l'];

    addCommandAfterInitializationSupport();

    if (!vars.reportingUrl && vars.reportingBackends.length === 0) {
      if (DEBUG) {
        error('No reporting URL configured. Aborting EUM initialization.');
      }
      return;
    }

    hookIntoUserTimings();
    instrumentXMLHttpRequest();
    instrumentFetch();
    hookIntoGlobalErrorEvent();
    wrapTimers();
    wrapEventHandlers();
    hookIntoGlobalUnhandledRejectionEvent();
    configAutoPageDetection();
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

function processCommands(commands: Array<any>) {
  for (let i = 0, len = commands.length; i < len; i++) {
    processCommand(commands[i]);
  }
}

function addCommandAfterInitializationSupport() {
  const globalObjectName = (win as any)[vars.nameOfLongGlobal];
  (win as any)[globalObjectName] = function () {
    /* eslint-disable prefer-rest-params */
    return processCommand(arguments as any);
  };
}

function fulfillsPrerequisites() {
  return win.XMLHttpRequest && win.JSON;
}

export function checkforSriIntegrity() {
  sriIntegrity = false;
  let matchedScript = null;
  const scriptElements = document.querySelectorAll('script');
  for (const script of scriptElements) {
    const src = script.getAttribute('src') || '';
    if (/.*eum.min.js$/.test(src) && !matchedScript) {
      matchedScript = script;
      break;
    }
  }
  if (matchedScript) {
    const checkIntegrityAttribute = matchedScript.getAttribute('integrity');
    if (checkIntegrityAttribute) {
      sriIntegrity = true;
    }
  }
}
