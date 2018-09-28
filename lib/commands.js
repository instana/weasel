// @flow

import {triggerManualPageLoad, startSpaPageTransition, endSpaPageTransition} from './fsm';
import {reportError} from './hooks/unhandledError';
import {warn} from './debug';
import vars from './vars';

export function processCommand(command: any[]): any {
  switch (command[0]) {
  case 'apiKey':
    vars.apiKey = command[1];
    break;
  case 'key':
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
      validateRegExpArray('ignoreUrls', command[1]);
    }
    vars.ignoreUrls = command[1];
    break;
  case 'whitelistedOrigins':
    if (DEBUG) {
      validateRegExpArray('whitelistedOrigins', command[1]);
    }
    vars.whitelistedOrigins = command[1];
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
    startSpaPageTransition();
    break;
  case 'endSpaPageTransition':
    endSpaPageTransition(command[1]);
    break;
  case 'autoClearResourceTimings':
    vars.autoClearResourceTimings = command[1];
    break;
  case 'page':
    vars.page = command[1];
    break;
  case 'ignorePings':
    vars.ignorePings = command[1];
    break;
  case 'reportError':
    reportError(command[1]);
    break;
  case 'wrapEventHandlers':
    vars.wrapEventHandlers = command[1];
    break;
  case 'wrapTimers':
    vars.wrapTimers = command[1];
    break;
  case 'getPageLoadId':
    return vars.pageLoadTraceId;
  case 'maxLengthForImgRequest':
    vars.maxLengthForImgRequest = command[1];
    break;
  default:
    if (DEBUG) {
      warn('Unsupported command: ' + command[0]);
    }
    break;
  }
}

function validateRegExpArray(name, arr) {
  if (!(arr instanceof Array)) {
    return warn(name + ' is not an array. This will result in errors.');
  }

  for (let i = 0, len = arr.length; i < len; i++) {
    if (!(arr[i] instanceof RegExp)) {
      return warn(name + '[' + i + '] is not a RegExp. This will result in errors.');
    }
  }
}
