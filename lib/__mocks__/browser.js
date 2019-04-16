/* eslint-env node */

export const encodeURIComponent = global.encodeURIComponent;
export const win = global.window;
export const doc = win.document;
export const nav = global.navigator;

export const xhrRequests = [];
export const OriginalXMLHttpRequest = function() {
  const requestFunctions = {};
  // Using the prototype chain to avoid adding mock functions to the jest snapshots.
  const request = Object.create(requestFunctions);
  request.requestHeader = [];
  requestFunctions.open = (...args) => request.open = args;
  requestFunctions.send = (...args) => request.send = args;
  requestFunctions.setRequestHeader = (...args) => request.requestHeader.push(args);
  xhrRequests.push(request);
  return request;
};

export const imageRequests = [];
export function executeImageRequest(path) {
  imageRequests.push(path);
}

export const beaconRequests = [];
export function sendBeacon(url, data) {
  beaconRequests.push({url, data});
}

export function reset() {
  xhrRequests.length = 0;
  imageRequests.length = 0;
  beaconRequests.length = 0;
}
