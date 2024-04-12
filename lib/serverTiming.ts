import {performance, isResourceTimingAvailable} from './performance';
import {info} from './debug';
import vars from './vars';

export function getPageLoadBackendTraceId() {
  if (!isResourceTimingAvailable) {
    return null;
  }

  const entries = performance.getEntriesByType('navigation');
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];

    if (entry['serverTiming'] != null) {
      for (let j = 0; j < entry['serverTiming'].length; j++) {
        const serverTiming = entry['serverTiming'][j];
        if (serverTiming['name'] === vars.serverTimingBackendTraceIdEntryName) {
          if (DEBUG) {
            info('Found page load backend trace ID %s in Server-Timing header.', serverTiming['description']);
          }
          return serverTiming['description'];
        }
      }
    }
  }

  return null;
}
