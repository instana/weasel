// @flow

import {performance, isTimingAvailable} from './performance';
import onLoadEvent from './events/onLoad';
import type {PageLoadBeacon} from './types';
import vars from './vars';

// See spec:
// https://www.w3.org/TR/navigation-timing/

export function addTimingToPageLoadBeacon(beacon: PageLoadBeacon) {
  if (!isTimingAvailable) {
    // This is our absolute fallback mode where we only have
    // approximations for speed information.
    beacon['ts'] = vars.initializerExecutionTimestamp - vars.referenceTimestamp;
    beacon['d'] = Number(onLoadEvent.time) - vars.initializerExecutionTimestamp;

    // We add this as an extra property to the beacon so that
    // a backend can decide whether it should include timing
    // information in aggregated metrics. Since they are only
    // approximations, this is not always desirable.
    if (!isTimingAvailable) {
      beacon['tim'] = '0';
    }

    return;
  }

  const timing = performance.timing;

  const redirectTime = timing.redirectEnd - timing.redirectStart;
  // We don't use navigationStart since that includes unload times for the previous
  // page.
  const start = timing.fetchStart - redirectTime;
  beacon['ts'] = start - vars.referenceTimestamp;
  beacon['d'] = timing.loadEventStart - timing.fetchStart;

  beacon['t_red'] = redirectTime;
  // TODO subtract request start
  beacon['t_fb'] = timing.responseStart - start;
  // TODO implement all the remaining times
  addFirstPaintTime(beacon, start);
}


function addFirstPaintTime(beacon: PageLoadBeacon, start: number) {
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
