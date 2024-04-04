// @flow

// aliasing globals for improved minifications

export const win: typeof window = window;
export const doc: any = win.document;
export const nav: any = navigator;
export const encodeURIComponent: (arg: string) => string = win.encodeURIComponent;
export const XMLHttpRequest = win.XMLHttpRequest;
export const originalFetch = win.fetch;
export const localStorage: Storage | null = (function () {
  try {
    return win.localStorage;
  } catch (e) {
    // localStorage access is not permitted in certain security modes, e.g.
    // when cookies are completely disabled in web browsers.
    return null;
  }
})();

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
