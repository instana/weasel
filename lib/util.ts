// @flow

import {win} from './browser';

// aliasing the global function for improved minification and
// protection against hasOwnProperty overrides.
const globalHasOwnProperty = Object.prototype.hasOwnProperty;
export function hasOwnProperty(obj: Record<string, unknown>, key: string) {
  return globalHasOwnProperty.call(obj, key);
}

export function now(): number {
  return new Date().getTime();
}

export function noop() {}

// We are trying to stay close to common tracing architectures and use
// a hex encoded 64 bit random ID.
const validIdCharacters: string[] = '0123456789abcdef'.split('');
let generateUniqueIdImpl: () => string = function generateUniqueIdViaRandom(): string {
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += validIdCharacters[Math.round(Math.random() * 15)];
  }
  return result;
};

if (win?.crypto?.getRandomValues && win?.Uint32Array) {
  generateUniqueIdImpl = function generateUniqueIdViaCrypto(): string {
    const array = new win.Uint32Array(2);
    win.crypto.getRandomValues(array);
    return array[0].toString(16) + array[1].toString(16);
  };
}

export const generateUniqueId = generateUniqueIdImpl;

export function addEventListener(target: EventTarget, eventType: string, callback: (arg: Event) => unknown) {
  if (target.addEventListener) {
    target.addEventListener(eventType, callback, false);
  } else if ((target as any).attachEvent) {
    (target as any).attachEvent('on' + eventType, callback);
  }
}


export function removeEventListener(target: EventTarget, eventType: string, callback: () => unknown) {
  if (target.removeEventListener) {
    target.removeEventListener(eventType, callback, false);
  } else if ((target as any).detachEvent) {
    (target as any).detachEvent('on' + eventType, callback);
  }
}


export function matchesAny(regexp: RegExp[], s: string) {
  for (let i = 0, len = regexp.length; i < len; i++) {
    if (regexp[i].test(s)) {
      return true;
    }
  }

  return false;
}
