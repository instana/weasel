// @flow

import {triggerManualPageLoad, startSpaPageTransition, endSpaPageTransition} from './fsm';
import {warn} from './debug';
import vars from './vars';

export function processCommand(command: any[]): void {
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
  case 'sampleRate':
    vars.sampleRate = command[1];
    break;
  default:
    if (DEBUG) {
      warn('Unsupported command: ' + command[0]);
    }
    break;
  }
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
