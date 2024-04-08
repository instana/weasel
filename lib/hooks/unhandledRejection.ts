import {reportError} from './unhandledError';
import {win} from '../browser';

const messagePrefix = 'Unhandled promise rejection: ';
const stackUnavailableMessage = '<unavailable because Promise wasn\'t rejected with an Error object>';

export function hookIntoGlobalUnhandledRejectionEvent() {
  if (typeof win.addEventListener === 'function') {
    win.addEventListener('unhandledrejection', onUnhandledRejection);
  }
}

export function onUnhandledRejection(event: PromiseRejectionEvent) {
  if (event.reason == null) {
    reportError({
      message: messagePrefix + '<no reason defined>',
      stack: stackUnavailableMessage
    });
  } else if (typeof event.reason.message === 'string') {
    reportError({
      message: messagePrefix + event.reason.message,
      stack: typeof event.reason.stack === 'string' ? event.reason.stack : stackUnavailableMessage
    });
  } else if (typeof event.reason !== 'object') {
    reportError({
      message: messagePrefix + event.reason,
      stack: stackUnavailableMessage
    });
  }
}
