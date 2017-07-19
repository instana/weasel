// @flow

import {performance, isResourceTimingAvailable} from './performance';
import type {BeaconWithResourceTiming} from './types';
import {info, debug} from './debug';
import {createTrie} from './trie';
import {win} from './browser';
import vars from './vars';

// See https://w3c.github.io/resource-timing/
// See https://www.w3.org/TR/hr-time/

const urlMaxLength = 255;

const initiatorTypes = {
  'other': 0,
  'img': 1,
  'link': 2,
  'script': 3,
  'css': 4,
  'xmlhttprequest': 5,
  'html': 6,
  // IMAGE element inside a SVG
  'image': 7
};

const cachingTypes = {
  unknown: 0,
  cached: 1,
  validated: 2,
  fullLoad: 3
};

export function addResourceTimings(beacon: BeaconWithResourceTiming, minStartTime: ?number) {
  if (isResourceTimingAvailable && win.JSON) {
    const entries = getEntriesTransferFormat(performance.getEntriesByType('resource'), minStartTime);
    beacon['res'] = win.JSON.stringify(entries);

    if (vars.autoClearResourceTimings && performance.clearResourceTimings) {
      debug('Automatically clearing resource timing buffer.');
      performance.clearResourceTimings();
    }
  } else if (DEBUG) {
    info('Resource timing not supported.');
  }
}


export function getEntriesTransferFormat(performanceEntries: Array<Object>, minStartTime: ?number) {
  const trie = createTrie();

  for (let i = 0, len = performanceEntries.length; i < len; i++) {
    const entry = performanceEntries[i];
    if (minStartTime != null &&
        (entry['startTime'] - vars.highResTimestampReference + vars.referenceTimestamp) < minStartTime) {
      continue;
    }

    let url = entry.name;
    if (url === 'about:blank' || url === 'javascript:false') {
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


function serializeEntry(entry: Object) {
  const result = [
    Math.round(entry['startTime'] - vars.highResTimestampReference),
    Math.round(entry['duration']),
    initiatorTypes[entry['initiatorType']] || initiatorTypes['other']
  ];

  // When timing data is available, we can provide additional information about
  // caching and resource sizes.
  if (typeof entry['transferSize'] === 'number' &&
      typeof entry['encodedBodySize'] === 'number' &&
      // All this information may not be available due to cross-origin.
      entry['encodedBodySize'] > 0) {
    if (entry['transferSize'] === 0) {
      result.push(cachingTypes.cached);
    } else if (entry['transferSize'] < entry['encodedBodySize']) {
      result.push(cachingTypes.validated);
    } else {
      result.push(cachingTypes.fullLoad);
    }

    result.push(entry['encodedBodySize']);
  }

  return result.join(',');
}
