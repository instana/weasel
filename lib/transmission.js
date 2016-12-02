// @flow

import type {BeaconData} from './types';
import vars from './vars';

export function sendBeacon(data: BeaconData) {
  const str = stringify(data);
  if (str.length === 0) {
    return;
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
      str += '&' + key + '=' + encodeURIComponent(String(data[key]));
    }
  }

  return str.substring(1);
}
