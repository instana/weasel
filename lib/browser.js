// @flow

// aliasing globals for improved minifications


export const win: any = window;
export const doc: any = win.document;
export const nav: any = navigator;
export const encodeURIComponent: string => string = win.encodeURIComponent;
export const OriginalXMLHttpRequest = win.XMLHttpRequest;
export const originalFetch = win.fetch;
