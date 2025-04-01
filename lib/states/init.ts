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

    // prefer the backend trace ID which was explicitly set
    vars.pageLoadBackendTraceId = vars.pageLoadBackendTraceId || getPageLoadBackendTraceId();

    // If the server is not monitored by Instana, the backend trace ID for the page load will be 
    // extracted from the traceparent injected by webserver service.
    // Reference: https://opentelemetry.io/docs/languages/js/getting-started/browser/ 
    const traceState = checkPageLoadTraceParentAvalable();
    if (vars.enableW3CHeaders && traceState) {
      vars.pageLoadBackendTraceId = traceState;
    }
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

// When a page request is made, the Instana JS SDK isn't initialized until the server returns the HTML and the app's 
// JS assets. To pass the trace from the server to the client, the trace ID is sent in a <meta> tag. 
/*
  Example: 
    <meta
      name="traceparent"
      content="00-ab42124a3c573678d4d8b21ba52df3bf-d21f7bc17caa5aba-01"
    />
*/
function checkPageLoadTraceParentAvalable() : string | null {
  const traceParentMeta = document.querySelector('meta[name="traceparent"]') as HTMLMetaElement;
  
  // Ensure that traceparent exists and is in the correct format
  if (!traceParentMeta || !traceParentMeta.content) {
    return null;
  }

  const traceParent = traceParentMeta.content;

  // Validity check: traceparent must have 3 parts and each part must have a valid length
  const traceParentParts = traceParent.split('-');
  if (traceParentParts.length === 4 && 
      traceParentParts[0] === '00' && // Ensure version is '00'
      traceParentParts[1].length === 32 && // Ensure trace ID length is 32
      traceParentParts[2].length === 16 && // Ensure span ID length is 16
      traceParentParts[3].length === 2) { // Ensure flags length is 2
    return traceParentParts[2]; // Return the tracestate
  }

  // If any part is invalid, return null
  return null;
}
