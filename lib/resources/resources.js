// @flow

import {performance, isResourceTimingAvailable} from '../performance';
import type {BeaconWithResourceTiming} from '../types';
import {serializeEntry} from './timingSerializer';
import {urlMaxLength} from './consts';
import {info, debug} from '../debug';
import {createTrie} from '../trie';
import {win} from '../browser';
import vars from '../vars';

// See https://w3c.github.io/resource-timing/
// See https://www.w3.org/TR/hr-time/

export function addResourceTimings(beacon: BeaconWithResourceTiming, minStartTime: ?number) {
  if (isResourceTimingAvailable && win.JSON) {
    const entries = getEntriesTransferFormat(performance.getEntriesByType('resource'), minStartTime);
    beacon['res'] = win.JSON.stringify(entries);

    if (vars.autoClearResourceTimings && performance.clearResourceTimings) {
      if (DEBUG) {
        debug('Automatically clearing resource timing buffer.');
      }
      performance.clearResourceTimings();
    }
  } else if (DEBUG) {
    info('Resource timing not supported.');
  }
}


function getEntriesTransferFormat(performanceEntries: Array<Object>, minStartTime: ?number) {
  const trie = createTrie();

  for (let i = 0, len = performanceEntries.length; i < len; i++) {
    const entry = performanceEntries[i];
    if (minStartTime != null &&
        (entry['startTime'] - vars.highResTimestampReference + vars.referenceTimestamp) < minStartTime) {
      continue;
    }

    let url = entry.name;
    const lowerCaseUrl = url.toLowerCase();
    if (lowerCaseUrl === 'about:blank' || lowerCaseUrl.indexOf('javascript:') === 0) {
      continue;
    }

    if (url.length > urlMaxLength) {
      url = url.substring(0, urlMaxLength);
    }

    // We provide more detailed XHR insights via our XHR instrumentation.
    // The XHR instrumentation is available once the initialization was executed
    // (which is completely synchronous).
    if (entry['initiatorType'] !== 'xmlhttprequest' || entry['startTime'] < vars.highResTimestampReference) {
      trie.addItem(url, serializeEntry(entry));
    }
  }

  return trie.toJs();
}
