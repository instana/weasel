// @flow

import {addEventListener, now, generateUniqueId} from '../util';
import type {UnhandledErrorBeacon} from '../types';
import {sendBeacon} from '../transmission';
import {win} from '../browser';
import vars from '../vars';


type TrackedError = {
  message: string,
  stack: string,
  location: string,
  seenCount: number,
  transmittedCount: number
}


const maxErrorsToReport = 100;
const maxStackSize = 30;

let reportedErrors = 0;
const maxSeenErrorsTracked = 20;
let numberOfDifferentErrorsSeen = 0;
let seenErrors: {[key: string]: TrackedError} = {};

let scheduledTransmissionTimeoutHandle;

export function hookIntoGlobalErrorEvent() {
  addEventListener(win, 'error', onUnhandledError);
}


function onUnhandledError(event) {
  // $FlowFixMe
  if (!event.error || !event.error.stack || reportedErrors > maxErrorsToReport) {
    return;
  }

  if (numberOfDifferentErrorsSeen >= maxSeenErrorsTracked) {
    seenErrors = {};
    numberOfDifferentErrorsSeen = 0;
  }

  const error = event.error;
  const message = String(error.message).substring(0, 300);
  const stack = String(error.stack).split('\n').slice(0, maxStackSize).join('\n');
  const location = win.location.href;
  const key = message + stack + location;

  let trackedError = seenErrors[key];
  if (trackedError) {
    trackedError.seenCount++;
  } else {
    trackedError = seenErrors[key] = {
      message,
      stack,
      location,
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
  // $FlowFixMe
  const beacon: UnhandledErrorBeacon = {
    // $FlowFixMe
    'k': vars.apiKey,
    't': generateUniqueId(),
    'ts': now(),

    // xhr beacon specific data
    'ty': 'err',
    'pl': vars.pageLoadTraceId,
    'l': error.location,
    'e': error.message,
    's': error.stack,
    'c': error.seenCount - error.transmittedCount
  };

  sendBeacon(beacon);
}
