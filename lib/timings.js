// @flow

import {performance, isTimingAvailable, isResourceTimingAvailable} from './performance';
import type {PageLoadBeacon} from './types';
import onLoadEvent from './events/onLoad';
import {win} from './browser';
import vars from './vars';

// See spec:
// https://www.w3.org/TR/navigation-timing/

export function getPageLoadStartTimestamp() {
  if (!isTimingAvailable) {
    return vars.initializerExecutionTimestamp - vars.referenceTimestamp;
  }
  // We don't use navigationStart since that includes unload times for the previous
  // page.
  const timing = performance.timing;
  return timing.fetchStart - (timing.redirectEnd - timing.redirectStart);
}

export function addTimingToPageLoadBeacon(beacon: PageLoadBeacon) {
  if (!isTimingAvailable) {
    // This is our absolute fallback mode where we only have
    // approximations for speed information.
    beacon['ts'] = getPageLoadStartTimestamp();
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
  // We don't use navigationStart since that includes unload times for the previous page.
  const start = getPageLoadStartTimestamp();
  beacon['ts'] = start - vars.referenceTimestamp;

  // This can happen when the user aborts the page load. In this case, the load event
  // timing information is not available and will have the default value of "0".
  if (timing.loadEventStart > 0) {
    beacon['d'] = timing.loadEventStart - timing.fetchStart;
  } else {
    beacon['d'] = Number(onLoadEvent.time) - vars.initializerExecutionTimestamp;

    // We have partial timing information, but since the load was aborted, we will
    // mark it as missing to indicate that the information should be ignored in
    // statistics.
    beacon['tim'] = '0';
  }

  beacon['t_unl'] = timing.unloadEventEnd - timing.unloadEventStart;
  beacon['t_red'] = redirectTime;
  beacon['t_apc'] = timing.domainLookupStart - timing.fetchStart;
  beacon['t_dns'] = timing.domainLookupEnd - timing.domainLookupStart;
  if (timing.secureConnectionStart != null && timing.secureConnectionStart > 0) {
    beacon['t_tcp'] = timing.secureConnectionStart - timing.connectStart;
    beacon['t_ssl'] = timing.connectEnd - timing.secureConnectionStart;
  } else {
    beacon['t_tcp'] = timing.connectEnd - timing.connectStart;
    beacon['t_ssl'] = 0;
  }
  beacon['t_req'] = timing.responseStart - timing.requestStart;
  beacon['t_rsp'] = timing.responseEnd - timing.responseStart;
  beacon['t_dom'] = timing.domContentLoadedEventStart - timing.domLoading;
  beacon['t_chi'] = timing.loadEventEnd - timing.domContentLoadedEventStart;
  beacon['t_bac'] = timing.responseStart - start;
  beacon['t_fro'] = timing.loadEventEnd - timing.responseStart;

  addFirstPaintTimings(beacon, start);
}


function addFirstPaintTimings(beacon: PageLoadBeacon, start: number) {
  if (!isResourceTimingAvailable) {
    addFirstPaintFallbacks(beacon, start);
    return;
  }

  const paintTimings = performance.getEntriesByType('paint');
  let firstPaintFound = false;
  for (let i = 0; i < paintTimings.length; i++) {
    const paintTiming = paintTimings[i];
    switch (paintTiming.name) {
    case 'first-paint':
      beacon['t_fp'] = paintTiming.startTime | 0;
      firstPaintFound = true;
      break;

    case 'first-contentful-paint':
      beacon['t_fcp'] = paintTiming.startTime | 0;
      break;
    }
  }

  if (!firstPaintFound) {
    addFirstPaintFallbacks(beacon, start);
  }
}

function addFirstPaintFallbacks(beacon: PageLoadBeacon, start: number) {
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
