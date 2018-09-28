// @flow

import {encodeURIComponent, OriginalXMLHttpRequest} from './browser';
import {hasOwnProperty} from './util';
import type {Beacon} from './types';
import {info} from './debug';
import vars from './vars';

export function sendBeacon(data: Beacon) {
  const str = stringify(data);
  if (str.length === 0) {
    return;
  }

  if (DEBUG) {
    info('Transmitting beacon', data);
  }

  if (OriginalXMLHttpRequest && str.length > vars.maxLengthForImgRequest) {
    const xhr = new OriginalXMLHttpRequest();
    xhr.open('POST', String(vars.reportingUrl), true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
    // Ensure that browsers do not try to automatically parse the response.
    xhr.responseType = 'text';
    xhr.timeout = vars.xhrTransmissionTimeout;
    xhr.send(str);
  } else {
    // Older browsers do not support the XMLHttpRequest API. This sucks and may
    // result in a variety of issues, e.g. URL length restrictions. "Luckily", older
    // browsers also lack support for advanced features such as resource timing.
    // This should make this transmission via a GET request possible.
    const image = new Image();
    image.src = String(vars.reportingUrl) + '?' + str;
  }
}

function stringify(data: Beacon) {
  let str = '';

  for (let key in data) {
    if (hasOwnProperty(data, key)) {
      const value = data[key];
      if (value != null) {
        str += '&' + encodeURIComponent(key) + '=' + encodeURIComponent(String(data[key]));
      }
    }
  }

  return str.substring(1);
}
