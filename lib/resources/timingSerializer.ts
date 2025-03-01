import { cachingTypes, initiatorTypes } from './consts';
import {info} from '../debug';
import vars from '../vars';

export function serializeEntryToArray(entry: PerformanceResourceTiming) {
  const result = [
    Math.round(entry['startTime'] - vars.highResTimestampReference),
    Math.round(entry['duration']),
    (initiatorTypes as any)[entry['initiatorType']] || initiatorTypes['other']
  ];

  // When timing data is available, we can provide additional information about
  // caching and resource sizes.
  let isCached = false;
  if (typeof entry['transferSize'] === 'number' &&
      typeof entry['encodedBodySize'] === 'number' &&
      // All this information may not be available due to the timing allow origin check.
      entry['encodedBodySize'] > 0) {
    if (entry['transferSize'] === 0) {
      result.push(cachingTypes.cached);
      isCached = true;
    } else if (entry['transferSize'] > 0 && (entry['encodedBodySize'] === 0 || entry['transferSize'] < entry['encodedBodySize'])) {
      result.push(cachingTypes.validated);
      isCached = true;
    } else {
      result.push(cachingTypes.fullLoad);
    }

    if (entry['encodedBodySize'] != null) {
      result.push(entry['encodedBodySize']);
    } else {
      result.push('');
    }
    if (entry['decodedBodySize'] != null) {
      result.push(entry['decodedBodySize']);
    } else {
      result.push('');
    }
    if (entry['transferSize'] != null) {
      result.push(entry['transferSize']);
    } else {
      result.push('');
    }
  } else {
    result.push('');
    result.push('');
    result.push('');
    result.push('');
  }

  const hasValidTimings = entry['responseStart'] != null &&
    // timing allow origin check may have failed
    entry['responseStart'] >= entry['fetchStart'];
  if (hasValidTimings) {
    result.push(calculateTiming(entry['redirectEnd'], entry['redirectStart']));
    result.push(calculateTiming(entry['domainLookupStart'], entry['fetchStart']));
    result.push(calculateTiming(entry['domainLookupEnd'], entry['domainLookupStart']));
    if (entry['connectStart'] > 0 && entry['connectEnd'] > 0) {
      if (entry['secureConnectionStart'] != null && entry['secureConnectionStart'] > 0) {
        result.push(calculateTiming(entry['secureConnectionStart'], entry['connectStart']));
        result.push(calculateTiming(entry['connectEnd'], entry['secureConnectionStart']));
      } else {
        result.push(calculateTiming(entry['connectEnd'], entry['connectStart']));
        result.push('');
      }
    } else {
      result.push('');
      result.push('');
    }
    result.push(calculateTiming(entry['responseStart'], entry['requestStart']));
    result.push(calculateTiming(entry['responseEnd'], entry['responseStart']));
  }

  let backendTraceId = '';
  try {
    const serverTimings = entry['serverTiming'];
    if (serverTimings instanceof Array) {
      for (let i = 0; i < serverTimings.length; i++) {
        const serverTiming = serverTimings[i];
        if (serverTiming['name'] === vars.serverTimingBackendTraceIdEntryName) {
          backendTraceId = serverTiming['description'];
          if (isCached) {
            if (DEBUG) {
              info('Response is cached, removed backendTraceId from response');
            }
            backendTraceId = '';
          }
        }
      }
    }
  } catch (e) {
    // Some browsers may not grant access to the field when the Timing-Allow-Origin
    // check fails. Better be safe than sorry here.
  }

  result.push(backendTraceId);

  if (hasValidTimings) {
    result.push(calculateTiming(entry['responseStart'], entry['startTime']));
  } else {
    result.push('');
  }

  return result;
}

export function serializeEntry(entry: PerformanceResourceTiming) {
  return serializeEntryToArray(entry).join(',')
    // remove empty trailing timings
    .replace(/,+$/, '');
}

function calculateTiming(a?: number, b?: number) {
  if (a == null || b == null ||
      // the values being equal indicates for example that a network connection didn't need
      // to be established. Do not report a timing of '0' as this will skew the statistics.
      a === b) {
    return '';
  }
  const diff = Math.round(a - b);
  if (diff < 0) {
    return '';
  }
  return diff;
}
