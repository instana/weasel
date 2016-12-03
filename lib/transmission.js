// @flow

import type {BeaconData} from './types';
import vars from './vars';
import {info} from './debug';

export function sendBeacon(data: BeaconData) {
  const str = stringify(data);
  if (str.length === 0) {
    return;
  }

  if (DEBUG) {
    info('Transmitting beacon', data);
  }

  const xhr = new XMLHttpRequest();
  xhr.open('POST', String(vars.reportingUrl), true);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.send(str);
}

function stringify(data: BeaconData) {
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
