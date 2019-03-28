// @flow

import {reportError} from './hooks/unhandledError';
import {reportCustomEvent} from './customEvents';
import {triggerManualPageLoad} from './fsm';
import {setPage} from './pageChange';
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
  case 'ignoreErrorMessages':
    if (DEBUG) {
      validateRegExpArray('ignoreErrorMessages', command[1]);
    }
    vars.ignoreErrorMessages = command[1];
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
  case 'autoClearResourceTimings':
    vars.autoClearResourceTimings = command[1];
    break;
  case 'page':
    setPage(command[1]);
    break;
  case 'ignorePings':
    vars.ignorePings = command[1];
    break;
  case 'reportError':
    reportError(command[1], command[2]);
    break;
  case 'wrapEventHandlers':
    vars.wrapEventHandlers = command[1];
    break;
  case 'wrapTimers':
    vars.wrapTimers = command[1];
    break;
  case 'getPageLoadId':
    return vars.pageLoadTraceId;
  case 'user':
    if (command[1]) {
      vars.userId = String(command[1]).substring(0, 128);
    }
    if (command[2]) {
      vars.userName = String(command[2]).substring(0, 128);
    }
    if (command[3]) {
      vars.userEmail = String(command[3]).substring(0, 128);
    }
    break;
  case 'reportEvent':
    reportCustomEvent(command[1], command[2]);
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
