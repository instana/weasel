// @flow

// aliasing globals for improved minifications


export const win: any = window;
export const doc: any = win.document;
export const nav: any = navigator;
export const encodeURIComponent: string => string = win.encodeURIComponent;
export const XMLHttpRequest = win.XMLHttpRequest;
export const originalFetch = win.fetch;
export const localStorage: Storage = win.localStorage;

/**
 * Leverage's browser behavior to load image sources. Exposed via this module
 * to enable testing.
 */
export function executeImageRequest(url: string) {
  const image = new Image();
  image.src = url;
}

/**
 * Exposed via this module to enable testing.
 */
export function sendBeacon(url: string, data: string): boolean {
  return nav.sendBeacon(url, data);
}
