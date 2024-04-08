/* eslint-disable prefer-rest-params */
import {warn, info} from './debug';
import {win} from './browser';

// This module contains wrappers around the standard timer API. These wrappers can be used to
// ensure that execution of timers happens outside of any Angular specific zones. This in turn
// means that this script will never disturb Angular's stabilization phase.
// https://angular.io/api/core/ApplicationRef#isStable
// Please note that it may sometimes be necessary to deliberately execute code inside of
// Angular's Zones. Always take care to make a deliberate decision when to use and when not to
// use these wrappers.

// We take a copy of all globals to ensure that no other script will change them all of a sudden.
// This ensures that when we register a timeout/interval on one global, that we will be able to
// de-register it again in all cases.
const globals = {
  'setTimeout': win.setTimeout,
  'clearTimeout': win.clearTimeout,
  'setInterval': win.setInterval,
  'clearInterval': win.clearInterval
};

// If the globals don't exist at execution time of this file, then we know that the globals stored
// above are not wrapped by Zone.js. This in turn can mean better performance for Angular users.
export const isRunningZoneJs = win['Zone'] != null &&
  win['Zone']['root'] != null &&
  typeof win['Zone']['root']['run'] === 'function';

if (DEBUG && isRunningZoneJs) {
  info('Discovered Zone.js globals. Will attempt to register all timers inside the root Zone.');
}

export function setTimeout(..._args: Parameters<typeof win.setTimeout>): ReturnType<typeof win.setTimeout> {
  return executeGlobally.apply('setTimeout', arguments as any);
}

export function clearTimeout(..._args: Parameters<typeof win.clearTimeout>): ReturnType<typeof win.clearTimeout> {
  return executeGlobally.apply('clearTimeout', arguments as any);
}

export function setInterval(..._args: Parameters<typeof win.setInterval>): ReturnType<typeof win.setInterval> {
  return executeGlobally.apply('setInterval', arguments as any);
}

export function clearInterval(..._args: Parameters<typeof win.clearInterval>): ReturnType<typeof win.clearInterval> {
  return executeGlobally.apply('clearInterval', arguments as any);
}

function executeGlobally(this: keyof typeof globals) {
  // We don't want to incur a performance penalty for all users just because some
  // users are relying on zone.js. This API looks quite ridiculous, but it
  // allows for concise and efficient code, e.g. arguments does not need to be
  // translated into an array.
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const globalFunctionName = this;

  if (isRunningZoneJs) {
    try {
      // Incurr a performance overhead for Zone.js users that we just cannot avoid:
      // Copy the arguments passed in here so that we can use them inside the root
      // zone.
      const args = Array.prototype.slice.apply(arguments);
      return win['Zone']['root']['run'](globals[globalFunctionName], win, args);
    } catch (e) {
      if (DEBUG) {
        warn('Failed to execute %s inside of zone (via Zone.js). Falling back to execution inside currently ' +
          'active zone.', globalFunctionName, e);
      }
      // failure – maybe zone js not properly initialized? Fall back to execution
      // outside of Zone.js as a last resort (outside of try/catch and if)
    }
  }

  // Note: Explicitly passing win as 'this' even though we are getting the function from 'globals'
  return (globals[globalFunctionName] as any).apply(win, arguments);
}
