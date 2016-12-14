// @flow

// aliasing the global function for improved minification
export function encodeURIComponent(v: string) {
  return window.encodeURIComponent(v);
}

// aliasing the global function for improved minification and
// protection against hasOwnProperty overrides.
const globalHasOwnProperty = Object.prototype.hasOwnProperty;
export function hasOwnProperty(obj: Object, key: string) {
  return globalHasOwnProperty.call(obj, key);
}

export function now(): number {
  return new Date().getTime();
}

export function noop() {}

// We are trying to stay close to common tracing architectures and use
// a hex encoded 64 bit random ID.
var validIdCharacters = '0123456789abcdef'.split('');
export function generateUniqueId(): string {
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += validIdCharacters[Math.round(Math.random() * 15)];
  }
  return result;
}


export function addEventListener(target: EventTarget, eventType: string, callback: () => mixed) {
  if (target.addEventListener) {
    target.addEventListener(eventType, callback, false);
  } else if (target.attachEvent) {
    target.attachEvent('on' + eventType, callback);
  }
}


export function removeEventListener(target: EventTarget, eventType: string, callback: () => mixed) {
  if (target.removeEventListener) {
    target.removeEventListener(eventType, callback, false);
  } else if (target.detachEvent) {
    target.detachEvent('on' + eventType, callback);
  }
}
