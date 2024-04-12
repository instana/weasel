import {performance, isResourceTimingAvailable} from '../performance';
import { isTransmitionRequest } from '../transmission/util';
import type {BeaconWithResourceTiming} from '../types';
import {serializeEntry} from './timingSerializer';
import {stripSecrets} from '../stripSecrets';
import {isUrlIgnored} from '../ignoreRules';
import {urlMaxLength} from './consts';
import {createTrie} from '../trie';
import {win} from '../browser';
import {info} from '../debug';
import vars from '../vars';

// See https://w3c.github.io/resource-timing/
// See https://www.w3.org/TR/hr-time/

export function addResourceTimings(beacon: Partial<BeaconWithResourceTiming>, minStartTime?: number) {
  if (!!isResourceTimingAvailable && win.JSON) {
    const entries = getEntriesTransferFormat(performance.getEntriesByType('resource'), minStartTime);
    beacon['res'] = win.JSON.stringify(entries);
  } else if (DEBUG) {
    info('Resource timing not supported.');
  }
}


function getEntriesTransferFormat(performanceEntries: PerformanceEntryList, minStartTime?: number) {
  const trie = createTrie();

  for (let i = 0, len = performanceEntries.length; i < len; i++) {
    const entry = performanceEntries[i] as PerformanceResourceTiming;
    if (minStartTime != null &&
        (entry['startTime'] - vars.highResTimestampReference + vars.referenceTimestamp) < minStartTime) {
      continue;
    } else if (entry['duration'] < 0) {
      // Some old browsers do not properly implement resource timing. They report negative durations.
      // Ignore instead of reporting these, as the data isn't usable.
      continue;
    }

    let url = entry.name;
    if (isUrlIgnored(url)) {
      if (DEBUG) {
        info('Will not include data about resource because resource URL is ignored via ignore rules.', entry);
      }
      continue;
    }

    const lowerCaseUrl = url.toLowerCase();
    const initiatorType = entry['initiatorType'];
    if (lowerCaseUrl === 'about:blank' || lowerCaseUrl.indexOf('javascript:') === 0 || // some iframe cases
      // Data transmission can be visible as a resource. Do not report it.
      isTransmitionRequest(url)) {
      continue;
    }

    if (url.length > urlMaxLength) {
      url = url.substring(0, urlMaxLength);
    }

    // We provide more detailed XHR insights via our XHR instrumentation.
    // The XHR instrumentation is available once the initialization was executed
    // (which is completely synchronous).
    if ((initiatorType !== 'xmlhttprequest' && initiatorType !== 'fetch') || entry['startTime'] < vars.highResTimestampReference) {
      trie.addItem(stripSecrets(url), serializeEntry(entry));
    }
  }

  return trie.toJs();
}
