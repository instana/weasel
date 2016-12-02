// @flow

var bus = {};

type Listener = mixed => mixed;

export function on(name: string, fn: Listener) {
  var listeners = bus[name] = bus[name] || [];
  listeners.push(fn);
}

export function off(name: string, fn: Listener) {
  var listeners = bus[name];
  if (!listeners) {
    return;
  }

  for (var i = listeners.length - 1; i >= 0; i--) {
    if (listeners[i] === fn) {
      listeners.splice(i, 1);
    }
  }

  if (listeners.length === 0) {
    delete bus[name];
  }
}

export function emit(name: string, value: mixed) {
  var listeners = bus[name];
  if (!listeners) {
    return;
  }
  for (var i = 0, length = listeners.length; i < length; i++) {
    listeners[i](value);
  }
}

export function reset() {
  bus = {};
}
