// @flow

// localStorage API re-exposed to allow testing.

import { localStorage } from './browser';

export const isSupported =
  localStorage != null && typeof localStorage.getItem === 'function' && typeof localStorage.setItem === 'function';

export function getItem(k: string): string | null | undefined {
  if (isSupported && localStorage) {
    return localStorage.getItem(k);
  }
  return null;
}

export function setItem(k: string, v: string): void {
  if (isSupported && localStorage) {
    localStorage.setItem(k, v);
  }
}

export function removeItem(k: string): void {
  if (isSupported && localStorage) {
    localStorage.removeItem(k);
  }
}
