/* eslint-env node */

export const encodeURIComponent = global.encodeURIComponent;
export const win = global.window;
export const doc = win.document;
export const nav = global.navigator;

export const xhrRequests: Array<any> = [];
export const XMLHttpRequest = function() {
  const requestFunctions: {
    open?: (...args: any[]) => void;
    send?: (...args: any[]) => void;
    setRequestHeader?: (...args: any[]) => void;
  } = {};
  // Using the prototype chain to avoid adding mock functions to the jest snapshots.
  const request = Object.create(requestFunctions);
  request.requestHeader = [];
  requestFunctions.open = (...args: any[]) => request.open = args;
  requestFunctions.send = (...args: any[]) => request.send = args;
  requestFunctions.setRequestHeader = (...args: any[]) => request.requestHeader.push(args);
  xhrRequests.push(request);
  return request;
};

export const imageRequests: Array<string> = [];
export function executeImageRequest(path: string) {
  imageRequests.push(path);
}

export const beaconRequests: Array<{
  url: string;
  data: string;
}> = [];
export function sendBeacon(url: string, data: string) {
  beaconRequests.push({url, data});
}

let localStorageStore: Record<string, string> = {};
export const localStorage: {
  getItem?: (k: string) => string;
  setItem?: (k: string, v: string) => void;
  removeItem?: (k: string) => void;
} = {};

export function reset() {
  xhrRequests.length = 0;
  imageRequests.length = 0;
  beaconRequests.length = 0;

  localStorageStore = {};
  localStorage.getItem = k => localStorageStore[k];
  localStorage.setItem = (k, v) => {localStorageStore[k] = v;};
  localStorage.removeItem = k => delete localStorageStore[k];
}

reset();
