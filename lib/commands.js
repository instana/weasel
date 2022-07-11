// @flow

import {trackSessions, terminateSession} from './session';
import {reportError} from './hooks/unhandledError';
import {reportCustomEvent} from './customEvents';
import {hasOwnProperty} from './util';
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
  case 'allowedOrigins':
  case 'whitelistedOrigins': // a deprecated alias for allowedOrigins
    if (DEBUG) {
      validateRegExpArray('allowedOrigins', command[1]);
    }
    vars.allowedOrigins = command[1];
    break;
  case 'ignoreUserTimings':
    if (DEBUG) {
      validateRegExpArray('ignoreUserTimings', command[1]);
    }
    vars.ignoreUserTimings = command[1];
    break;
  case 'xhrTransmissionTimeout':
    vars.xhrTransmissionTimeout = command[1];
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
  case 'beaconBatchingTime':
    vars.beaconBatchingTime = command[1];
    break;
  case 'maxWaitForResourceTimingsMillis':
    vars.maxWaitForResourceTimingsMillis = command[1];
    break;
  case 'maxMaitForPageLoadMetricsMillis':
    vars.maxMaitForPageLoadMetricsMillis = command[1];
    break;
  case 'trackSessions':
    trackSessions(command[1], command[2]);
    break;
  case 'terminateSession':
    terminateSession();
    break;
  case 'urlsToCheckForGraphQlInsights':
    if (DEBUG) {
      validateRegExpArray('urlsToCheckForGraphQlInsights', command[1]);
    }
    vars.urlsToCheckForGraphQlInsights = command[1];
    break;
  case 'secrets':
    if (DEBUG) {
      validateRegExpArray('secrets', command[1]);
    }
    vars.secrets = command[1];
    break;
  case 'captureHeaders':
    if (DEBUG) {
      validateRegExpArray('captureHeaders', command[1]);
    }
    vars.headersToCapture = command[1];
    break;
  case 'debug':
    // Not using an if (DEBUG) {…} wrapper nor the integrated logging
    // facilities to keep the end-user impact as low as possible.
    console.log({vars});
    break;
  case 'reportingBackends':
    processReportingBackends(command[1]);
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

function processReportingBackends(arr) {
  vars.reportingBackends.length = 0;
  if (!(arr instanceof Array)) {
    if (DEBUG) {
      warn('reportingBackends is not an array. This command will be ignored.');
    }
    return;
  }

  for (let i = 0, len = arr.length; i < len; i++) {
    let item = arr[i];
    if (!item || !item['reportingUrl'] || !hasOwnProperty(item, 'key')) {
      if (DEBUG) {
        warn('reportingBackends[' + i + '] is not a ReportingBackend. It will be ignored.');
      }
    } else {
      vars.reportingBackends.push(arr[i]);
    }
  }
}
