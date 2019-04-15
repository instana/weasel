// @flow

import {win, OriginalXMLHttpRequest} from '../browser';
import type {Beacon} from '../types';
import vars from '../vars';

export const isSupported = !!OriginalXMLHttpRequest && !!win.JSON;

export function sendBeacon(beacon: Beacon) {
  const xhr = new OriginalXMLHttpRequest();
  xhr.open('POST', String(vars.reportingUrl), true);
  xhr.setRequestHeader('Content-type', 'application/json;charset=UTF-8');
  // Ensure that browsers do not try to automatically parse the response.
  xhr.responseType = 'text';
  xhr.timeout = vars.xhrTransmissionTimeout;
  xhr.send(win.JSON.stringify([beacon]));
}
