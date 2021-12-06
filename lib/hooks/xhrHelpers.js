import {serializeEntryToArray} from '../resources/timingSerializer';
import type {XhrBeacon} from '../types';
import {matchesAny} from '../util';
import vars from '../vars';

/*
 * This file exists to resolve circular dependencies between
 * lib/transmission/index.js -> lib/transmission/batched.js -> lib/hooks/XMLHttpRequest.js -> lib/transmission/index.js
 */

export function disableMonitoringForXMLHttpRequest(xhr: XMLHttpRequest): void {
  const state = xhr[vars.secretPropertyKey] = xhr[vars.secretPropertyKey] || {};
  state.ignored = true;
}

export function addResourceTiming(beacon: XhrBeacon, resource: PerformanceEntry) {
  const timings = serializeEntryToArray(resource);

  beacon['s_ty'] = getTimingValue(timings[3]);
  beacon['s_eb'] = getTimingValue(timings[4]);
  beacon['s_db'] = getTimingValue(timings[5]);
  beacon['s_ts'] = getTimingValue(timings[6]);
  beacon['t_red'] = getTimingValue(timings[7]);
  beacon['t_apc'] = getTimingValue(timings[8]);
  beacon['t_dns'] = getTimingValue(timings[9]);
  beacon['t_tcp'] = getTimingValue(timings[10]);
  beacon['t_ssl'] = getTimingValue(timings[11]);
  beacon['t_req'] = getTimingValue(timings[12]);
  beacon['t_rsp'] = getTimingValue(timings[13]);
  if (timings[14]) {
    beacon['bt'] = timings[14];
    beacon['bc'] = 1;
  }
  beacon['t_ttfb'] = getTimingValue(timings[15]);
}

function getTimingValue(timing: any) {
  if (typeof timing === 'number') {
    return timing;
  }
  return undefined;
}

export function addCorrelationHttpHeaders(fn, ctx, traceId) {
  fn.call(ctx, 'X-INSTANA-T', traceId);
  fn.call(ctx, 'X-INSTANA-S', traceId);
  fn.call(ctx, 'X-INSTANA-L', '1,correlationType=web;correlationId=' + traceId);
}

export function captureHeaders(fn, ctx, beacon) {
  if (vars.headersToCapture.length === 0) {
    return;
  }

  fn.call(ctx, function(value, name){
    if(matchesAny(vars.headersToCapture, name)){
      beacon['h_'+name.toLowerCase()] = value;
    }
  });
}

export function captureXhrHeaders(beacon, headers) {
  if (vars.headersToCapture.length === 0) {
    return;
  }

  for(let key in headers) {
    if(matchesAny(vars.headersToCapture, key)){
      //may need check and validation on limits of header.
      beacon['h_'+key.toLowerCase()] = headers[key];
    }
  }
}

export function convertHeader(headerString) {
  const headers = {};
  const lines = headerString.trim().split(/[\r\n]+/);
  lines.forEach(function(line){
    const items = line.split(': ');
    const key = items[0];
    const value = items.slice(1).join(': ');
    headers[key] = value;
  });
  return headers;
}
