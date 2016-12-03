// @flow

import onLoadEvent from './events/onLoad';
import vars from './vars';

// See spec:
// https://www.w3.org/TR/navigation-timing/

// a wrapper around window.performance for cross-browser support
const performance = window.performance || window.webkitPerformance || window.msPerformance || window.mozPerformance;
export const isTimingAvailable = performance && performance.timing;

export function addTimingToPageLoadBeacon(beacon) {
  if (!isTimingAvailable) {
    // This is our absolute fallback mode where we only have
    // approximations for speed information.
    beacon['ts'] = vars.initializerExecutionTimestamp;
    beacon['d'] = onLoadEvent.time - vars.initializerExecutionTimestamp;
    return;
  }

  const timing = performance.timing;
  beacon['ts'] = timing.fetchStart - vars.referenceTimestamp;
  beacon['d'] = timing.loadEventStart - timing.fetchStart;
}
