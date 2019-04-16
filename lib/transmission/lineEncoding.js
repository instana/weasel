// @flow

import {hasOwnProperty} from '../util';

// We know that must values are plain key/value pairs. We therefore choose a format that is
// very easy to parse in a streaming fashion on the server-side. This format is a basic
// line-based encoding of key/value pairs. Each line contains a key/value pair.
//
// In contrast to form encoding, this encoding handles JSON much better.
export function encode(beacons: Array<Object>) {
  let str = '';

  for (let i = 0; i < beacons.length; i++) {
    const beacon = beacons[i];

    // Multiple beacons are separated by an empty line
    str += '\n';

    for (let key in beacon) {
      if (hasOwnProperty(beacon, key)) {
        const value = beacon[key];
        if (value != null) {
          str += '\n' + encodePart(key) + '\t' + encodePart(value);
        }
      }
    }
  }

  return str.substring(2);
}

function encodePart(part: any) {
  return String(part)
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t');
}
