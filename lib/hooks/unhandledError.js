// @flow

import {addCommonBeaconProperties, addMetaDataToBeacon} from '../commonBeaconProperties';
import type {UnhandledErrorBeacon, ReportErrorOpts} from '../types';
import {isErrorMessageIgnored} from '../ignoreRules';
import {setTimeout, clearTimeout} from '../timers';
import {sendBeacon} from '../transmission/index';
import {now, generateUniqueId} from '../util';
import {getActiveTraceId} from '../fsm';
import {win} from '../browser';

type TrackedError = {
  seenCount: number,
  transmittedCount: number,
  beacon: UnhandledErrorBeacon
}

const maxErrorsToReport = 100;
const maxStackSize = 30;

let reportedErrors = 0;
const maxSeenErrorsTracked = 20;
let numberOfDifferentErrorsSeen = 0;
let seenErrors: {[key: string]: TrackedError} = {};
let scheduledTransmissionTimeoutHandle;

// We are wrapping global listeners. In these, we are catching and rethrowing errors.
// In older browsers, rethrowing errors actually manipulates the error objects. As a
// result, it is not possible to just mark an error as reported. The simplest way to
// avoid double reporting is to temporarily disable the global onError handler…
let ignoreNextOnError = false;

export function ignoreNextOnErrorEvent() {
  ignoreNextOnError = true;
}

export function hookIntoGlobalErrorEvent() {
  let globalOnError = win.onerror;

  win.onerror = function(message, fileName, lineNumber, columnNumber, error) {
    if (ignoreNextOnError) {
      ignoreNextOnError = false;
      if (typeof globalOnError === 'function') {
        return globalOnError.apply(this, arguments);
      }
      return;
    }

    let stack = error && error.stack;
    if (!stack) {
      stack = 'at ' + fileName + ' ' + lineNumber;
      if (columnNumber != null) {
        stack += ':' + columnNumber;
      }
    }
    onUnhandledError(message, stack);

    if (typeof globalOnError === 'function') {
      return globalOnError.apply(this, arguments);
    }
  };
}

export function reportError(error: string | ErrorLike, opts: ?ReportErrorOpts) {
  if (!error) {
    return;
  }

  if (typeof error === 'string') {
    onUnhandledError(error, '', opts);
  } else {
    onUnhandledError(error['message'], error['stack'], opts);
  }
}

function onUnhandledError(message, stack, opts: ?ReportErrorOpts) {
  if (!message || reportedErrors > maxErrorsToReport) {
    return;
  }

  if (isErrorMessageIgnored(message)) {
    return;
  }

  if (numberOfDifferentErrorsSeen >= maxSeenErrorsTracked) {
    seenErrors = {};
    numberOfDifferentErrorsSeen = 0;
  }

  message = String(message).substring(0, 300);
  stack = shortenStackTrace(stack);
  const location = win.location.href;
  const parentId: ?string = getActiveTraceId();
  const key = message + stack + location + (parentId || '');

  let trackedError = seenErrors[key];
  if (trackedError) {
    trackedError.seenCount++;
    trackedError.beacon['c'] = trackedError.seenCount - trackedError.transmittedCount;
  } else {
    let componentStack = undefined;
    if (opts && opts['componentStack']) {
      componentStack = String(opts['componentStack']).substring(0, 4096);
    }

    const spanId = generateUniqueId();
    const traceId = parentId || spanId;
    trackedError = seenErrors[key] = {
      seenCount: 1,
      transmittedCount: 0,
      // $FlowFixMe
      beacon: {
        'ty': 'err',

        's': spanId,
        't': traceId,
        'ts': now(),

        // error beacon specific data
        'l': location,
        'e': message,
        'st': stack,
        'cs': componentStack,
        'c': 1
      }
    };

    // we cannot delay the creation of error beacon as common properties might be changed
    addCommonBeaconProperties(trackedError.beacon);
    if (opts && opts['meta']) {
      addMetaDataToBeacon(trackedError.beacon, opts['meta']);
    }

    numberOfDifferentErrorsSeen++;
  }

  scheduleTransmission();
}

export function shortenStackTrace(stack: ?string): string {
  return String(stack || '').split('\n').slice(0, maxStackSize).join('\n');
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


function sendBeaconForError(error: TrackedError) {
  sendBeacon(error.beacon);
}
