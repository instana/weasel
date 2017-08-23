// @flow
/* eslint-disable no-undef */

export type ShortBoolean = 0 | 1;

export type Event = {
  initialize: () => mixed,
  name: string,
  time: ?number
}

export type EndSpaPageTransitionOpts = {
  url: string,
  status: 'completed' | 'aborted' | 'error',
  explanation: ?string
}

export type State = {
  onEnter: () => mixed,
  getActiveTraceId(): ?string,
  triggerManualPageLoad(): void,
  startSpaPageTransition(): void,
  endSpaPageTransition(opts: EndSpaPageTransitionOpts): void
}

export interface Beacon {
  // The API key.
  k: string,

  // The trace ID of this beacon.
  t: string,

  // start timestamp in millis
  ts: number,

  // name of the page
  p: ?string,

  // Meta data
  // m_abc: string,

  [key: string]: ?number|?string
}

export interface BeaconWithResourceTiming extends Beacon {
  // The reference timestamp. All timestamps are resolved against this one via:
  // timestampToTransmit = actualTimestamp - referenceTimestamp
  r: number,

  // JSON-serialized resource timing trie
  res: string
}

export interface PageLoadBeacon extends Beacon, BeaconWithResourceTiming {
  ty: 'pl',

  // The reference timestamp. All timestamps are resolved against this one via:
  // timestampToTransmit = actualTimestamp - referenceTimestamp
  r: number,

  // duration in millis
  d: number,

  // A backend trace ID when available
  bt: string,

  // timing data available?
  tim: ShortBoolean,

  t_unl: number,
  t_red: number,
  t_apc: number,
  t_dns: number,
  t_tcp: number,
  t_ssl: number,
  t_req: number,
  t_rsp: number,
  t_dom: number,
  t_chi: number,
  t_bac: number,
  t_fro: number,
  t_fp: number,
  t_fcp: number
}


export interface XhrBeacon extends Beacon {
  // The reference timestamp. All timestamps are resolved against this one via:
  // timestampToTransmit = actualTimestamp - referenceTimestamp
  r: number,

  // duration in millis
  d: number,

  ty: 'xhr',

  // the span ID of this beacon
  s: string,

  // the ID of the page load trace
  pl: string,

  // location, as in the whole URL from window.location.href.
  // Provided so that beacon receivers can translate relative
  // URLs to the actual targets.
  l: string,

  // method
  m: string,

  // url as specified in the user request. May not contain schema / host
  u: string,

  // async
  a: ShortBoolean,

  // status code
  st: number,

  // error message
  e: ?string
}


export interface UnhandledErrorBeacon extends Beacon {
  ty: 'err',

  // span id
  s: string,

  // the ID of the page load trace
  pl: string,

  // location, as in the whole URL from window.location.href
  l: string,

  // error message
  e: string,

  // error stack
  st: string,

  // how many times this error was seen since the last transmission
  c: number
}


export interface SpaBeacon extends Beacon, BeaconWithResourceTiming {
  ty: 'spa',

  // the ID of the page load trace
  pl: string,

  // target location to which the spa navigated / wanted to navigate
  l: string,

  // duration in millis
  d: number,

  // Result status or whether or not this page transition was successfully executed, aborted or an error occured
  // completed = c
  // aborted = a
  // error = e
  // unknown = u (this basically means wrong usage)
  s: 'c' | 'a' | 'e' | 'u',

  // Explanation, e.g. error message or reason for abort
  e: string
}

// Used to mark this page view as an error. Will probably not be stored as a trace in a tracing
// system, but instead is only used to calculate metrics.
// The intention behind this beacon is to allow tracing systems to efficiently calculate a
// metric called "erroneous page views". This metric would model page views with at least
// one error. Counting uncaught error beacons will be resource intensive when done right
// in the tracing system or wrong when done poorly. This beacon makes backend implementations
// a lot simpler without incurring a performance impact in the UI.
export interface ErroneousPageViewBeacon extends Beacon {
  ty: 'epv',

  // the ID of the page load trace
  pl: string
}
