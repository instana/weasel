// @flow

let bus: Record<string, Array<Listener>> = {};

type Listener = (arg0: unknown) => unknown;

export function on(name: string, fn: Listener) {
  const listeners = bus[name] = bus[name] || [];
  listeners.push(fn);
}

export function off(name: string, fn: Listener) {
  const listeners = bus[name];
  if (!listeners) {
    return;
  }

  for (let i = listeners.length - 1; i >= 0; i--) {
    if (listeners[i] === fn) {
      listeners.splice(i, 1);
    }
  }

  if (listeners.length === 0) {
    delete bus[name];
  }
}

export function emit(name: string, value: unknown) {
  const listeners = bus[name];
  if (!listeners) {
    return;
  }
  for (let i = 0, length = listeners.length; i < length; i++) {
    listeners[i](value);
  }
}

export function reset() {
  bus = {};
}
