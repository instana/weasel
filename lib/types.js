// @flow
/* eslint-disable no-undef */

export type ShortBoolean = 0 | 1;

export type Event = {
  initialize: () => mixed,
  name: string,
  time: ?number
}

export type State = {
  onEnter: () => mixed,
  getActiveTraceId(): ?string,
  triggerManualPageLoad: () => void
}

export interface Beacon {
  // The API key.
  k: string,

  // The trace ID of this beacon.
  t: string,

  // start timestamp in millis
  ts: number,

  [key: string]: ?number|?string
}

export interface PageLoadBeacon extends Beacon {
  ty: 'pl',

  // The reference timestamp. All timestamps are resolved against this one via:
  // timestampToTransmit = actualTimestamp - referenceTimestamp
  r: number,

  // duration in millis
  d: number,

  // A backend trace ID when available
  bt: string,

  // Meta data
  m: string,

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
  t_pro: number,
  t_loa: number,
  t_loa: number,
  t_bac: number,
  t_fro: number,
  t_fp: number,

  // JSON-serialized resource timing trie
  res: string
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


export interface SpaBeacon extends Beacon {
  ty: 'spa',

  // span id
  s: string,

  // the ID of the page load trace
  pl: string,

  // target location to which the spa navigated / wanted to navigate
  l: string,

  // Result status or whether or not this page transition was successfully executed, aborted or an error occured
  // successful = s
  // aborted = a
  // error =
  r: 's' | 'a' | 'e',

  // Explanation, e.g. error message or reason for abort
  e: string,

  // JSON-serialized resource timing trie from start of page transition to end.
  res: string
}
