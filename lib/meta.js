import {hasOwnProperty} from './util';
import type {Beacon} from './types';
import vars from './vars';

export function addMetaDataToBeacon(beacon: Beacon) {
  for (let key in vars.meta) {
    if (hasOwnProperty(vars.meta, key)) {
      beacon['m_' + key] = vars.meta[key];
    }
  }
}
