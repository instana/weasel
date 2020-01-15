// @flow

// localStorage API re-exposed to allow testing.

import { localStorage } from './browser';

export const isSupported =
  localStorage != null && typeof localStorage.getItem === 'function' && typeof localStorage.setItem === 'function';

export function getItem(k: string): ?string {
  return localStorage.getItem(k);
}

export function setItem(k: string, v: string): void {
  localStorage.setItem(k, v);
}

export function removeItem(k: string): void {
  localStorage.removeItem(k);
}
