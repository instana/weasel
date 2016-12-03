// @flow

import onLoadEvent from './events/onLoad';
import type {BeaconData} from './types';
import vars from './vars';

// See spec:
// https://www.w3.org/TR/navigation-timing/

// a wrapper around window.performance for cross-browser support
const performance = window.performance || window.webkitPerformance || window.msPerformance || window.mozPerformance;
export const isTimingAvailable = performance && performance.timing;

export function addTimingToPageLoadBeacon(beacon: BeaconData) {
  if (!isTimingAvailable) {
    // This is our absolute fallback mode where we only have
    // approximations for speed information.
    beacon['ts'] = vars.initializerExecutionTimestamp;
    beacon['d'] = Number(onLoadEvent.time) - vars.initializerExecutionTimestamp;
    return;
  }

  const timing = performance.timing;

  const redirectTime = timing.redirectEnd - timing.redirectStart;
  // We don't use navigationStart since that includes unload times for the previous
  // page.
  const start = timing.fetchStart - redirectTime;
  beacon['ts'] = start - vars.referenceTimestamp;
  beacon['d'] = timing.loadEventStart - timing.fetchStart;

  beacon['t_redirect'] = redirectTime;
  beacon['t_fb'] = timing.responseStart - start;
  addFirstPaintTime(beacon, start);
}


function addFirstPaintTime(beacon: BeaconData, start: number) {
  let firstPaint = null;

  // Chrome
  if (window.chrome && window.chrome.loadTimes) {
    // Convert to ms
    firstPaint = window.chrome.loadTimes().firstPaintTime * 1000;
  }
  // IE
  else if (typeof window.performance.timing.msFirstPaint === 'number') {
    firstPaint = window.performance.timing.msFirstPaint;
  }
  // standard
  else if (typeof window.performance.timing.firstPaint === 'number') {
    firstPaint = window.performance.timing.firstPaint;
  }

  // First paint may not be available -OR- the browser may have never
  // painted anything and thereby kept this value at 0.
  if (firstPaint != null && firstPaint !== 0) {
    beacon['t_fp'] = firstPaint - start;
  }
}
