// @flow

import type {PageLoadBeacon} from './types';
import vars from './vars';
import {info} from './debug';

export function sendBeacon(data: PageLoadBeacon) {
  const str = stringify(data);
  if (str.length === 0) {
    return;
  }

  if (DEBUG) {
    info('Transmitting beacon', data);
  }

  if (window.XMLHttpRequest) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', String(vars.reportingUrl), true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send(str);
  } else {
    // Older browsers do not support the XMLHttpRequest API. This sucks and may
    // result in a variety of issues, e.g. length restrictions. "Luckily", older
    // browsers also lack support for advanced features such as resource timing.
    // This should make this transmission via a GET request possible.
    const image = new Image();
    image.src = String(vars.reportingUrl) + '?' + str;
  }
}

function stringify(data: PageLoadBeacon) {
  let str = '';

  for (let key in data) {
    if (data.hasOwnProperty(key)) {
      const value = data[key];
      if (value != null) {
        str += '&' + key + '=' + encodeURIComponent(String(data[key]));
      }
    }
  }

  return str.substring(1);
}
