// @flow

import {performance, isTimingAvailable} from './performance';
import type {PageLoadBeacon} from './types';
import onLoadEvent from './events/onLoad';
import {win} from './browser';
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

  beacon['t_unl'] = timing.unloadEventEnd - timing.unloadEventStart;
  beacon['t_red'] = redirectTime;
  beacon['t_apc'] = timing.domainLookupStart - timing.fetchStart;
  beacon['t_dns'] = timing.domainLookupEnd - timing.domainLookupStart;
  beacon['t_tcp'] = timing.connectEnd - timing.connectStart;
  beacon['t_req'] = timing.responseStart - timing.requestStart;
  beacon['t_rsp'] = timing.responseEnd - timing.responseStart;
  beacon['t_pro'] = timing.loadEventStart - timing.responseEnd;
  beacon['t_loa'] = timing.loadEventEnd - timing.loadEventStart;

  addFirstPaintTime(beacon, start);
}


function addFirstPaintTime(beacon: PageLoadBeacon, start: number) {
  let firstPaint = null;

  // Chrome
  if (win.chrome && win.chrome.loadTimes) {
    // Convert to ms
    firstPaint = win.chrome.loadTimes().firstPaintTime * 1000;
  }
  // IE
  else if (typeof win.performance.timing.msFirstPaint === 'number') {
    firstPaint = win.performance.timing.msFirstPaint;
  }
  // standard
  else if (typeof win.performance.timing.firstPaint === 'number') {
    firstPaint = win.performance.timing.firstPaint;
  }

  // First paint may not be available -OR- the browser may have never
  // painted anything and thereby kept this value at 0.
  if (firstPaint != null && firstPaint !== 0) {
    beacon['t_fp'] = Math.round(firstPaint - start);
  }
}
