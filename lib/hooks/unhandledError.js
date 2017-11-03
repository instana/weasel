// @flow

import type {UnhandledErrorBeacon, ErroneousPageViewBeacon} from '../types';
import {getPageLoadStartTimestamp} from '../timings';
import {now, generateUniqueId, getSampledFlag} from '../util';
import {addMetaDataToBeacon} from '../meta';
import {sendBeacon} from '../transmission';
import {getActiveTraceId} from '../fsm';
import {win} from '../browser';
import vars from '../vars';


type TrackedError = {
  message: string,
  stack: string,
  location: string,
  parentId: ?string,
  seenCount: number,
  transmittedCount: number
}


const maxErrorsToReport = 100;
const maxStackSize = 30;

let reportedErrors = 0;
let erroneousPageViewReported = false;
const maxSeenErrorsTracked = 20;
let numberOfDifferentErrorsSeen = 0;
let seenErrors: {[key: string]: TrackedError} = {};

let scheduledTransmissionTimeoutHandle;

export function hookIntoGlobalErrorEvent() {
  let globalOnError = win.onerror;
  win.onerror = function(message, fileName, lineNumber, columnNumber, error) {
    let stack = error && error.stack;
    if (!stack) {
      stack = 'at ' + fileName + ' ' + lineNumber + ':' + columnNumber;
    }
    onUnhandledError(message, stack);
    if (typeof globalOnError === 'function') {
      return globalOnError.apply(this, arguments);
    }
  };
}


function onUnhandledError(message, stack) {
  if (!erroneousPageViewReported) {
    erroneousPageViewReported = true;
    sendErroneousPageViewBeacon();
  }

  if (!message || reportedErrors > maxErrorsToReport) {
    return;
  }

  if (numberOfDifferentErrorsSeen >= maxSeenErrorsTracked) {
    seenErrors = {};
    numberOfDifferentErrorsSeen = 0;
  }

  message = String(message).substring(0, 300);
  stack = String(stack || '').split('\n').slice(0, maxStackSize).join('\n');
  const location = win.location.href;
  const parentId: ?string = getActiveTraceId();
  const key = message + stack + location + parentId;

  let trackedError = seenErrors[key];
  if (trackedError) {
    trackedError.seenCount++;
  } else {
    trackedError = seenErrors[key] = {
      message,
      stack,
      location,
      parentId,
      seenCount: 1,
      transmittedCount: 0
    };
    numberOfDifferentErrorsSeen++;
  }

  scheduleTransmission();
}


function scheduleTransmission() {
  if (scheduledTransmissionTimeoutHandle) {
    return;
  }

  scheduledTransmissionTimeoutHandle = setTimeout(send, 1000);
}


function send() {
  clearTimeout(scheduledTransmissionTimeoutHandle);
  scheduledTransmissionTimeoutHandle = null;

  for (let key in seenErrors) {
    if (seenErrors.hasOwnProperty(key)) {
      const seenError = seenErrors[key];
      if (seenError.seenCount > seenError.transmittedCount) {
        sendBeaconForError(seenError);
        reportedErrors++;
      }
    }
  }

  seenErrors = {};
  numberOfDifferentErrorsSeen = 0;
}


function sendBeaconForError(error) {
  const spanId = generateUniqueId();
  const traceId = error.parentId || spanId;
  // $FlowFixMe
  const beacon: UnhandledErrorBeacon = {
    // $FlowFixMe
    'k': vars.apiKey,
    's': spanId,
    't': traceId,
    'ts': now(),
    'p': vars.page,

    // xhr beacon specific data
    'ty': 'err',
    'pl': vars.pageLoadTraceId,
    'l': error.location,
    'e': error.message,
    'st': error.stack,
    'c': error.seenCount - error.transmittedCount,
    'sp': getSampledFlag(vars.sampleRate)
  };
  addMetaDataToBeacon(beacon);

  sendBeacon(beacon);
}


function sendErroneousPageViewBeacon() {
  // $FlowFixMe
  const beacon: ErroneousPageViewBeacon = {
    // $FlowFixMe
    'k': vars.apiKey,
    't': generateUniqueId(),
    'ts': getPageLoadStartTimestamp(),
    'p': vars.page,

    // epv beacon specific data
    'ty': 'epv',
    'pl': vars.pageLoadTraceId,
    'sp': getSampledFlag(vars.sampleRate)
  };
  addMetaDataToBeacon(beacon);
  sendBeacon(beacon);
}
