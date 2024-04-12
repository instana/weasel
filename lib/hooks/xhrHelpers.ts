import {serializeEntryToArray} from '../resources/timingSerializer';
import type {XhrBeacon} from '../types';
import vars from '../vars';

/*
 * This file exists to resolve circular dependencies between
 * lib/transmission/index.js -> lib/transmission/batched.js -> lib/hooks/XMLHttpRequest.js -> lib/transmission/index.js
 */

export function disableMonitoringForXMLHttpRequest(xhr: XMLHttpRequest): void {
  const state = (xhr as any)[vars.secretPropertyKey] = (xhr as any)[vars.secretPropertyKey] || {};
  state.ignored = true;
}

export function addResourceTiming(beacon: Partial<XhrBeacon>, resource: PerformanceResourceTiming) {
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

export function addCorrelationHttpHeaders(fn: (name: string, value: string) => void, ctx: any, traceId: string) {
  fn.call(ctx, 'X-INSTANA-T', traceId);
  fn.call(ctx, 'X-INSTANA-S', traceId);
  fn.call(ctx, 'X-INSTANA-L', '1,correlationType=web;correlationId=' + traceId);
}
