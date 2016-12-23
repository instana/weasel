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
  getActiveTraceId(): ?string
}

export interface Beacon {
  // The reference timestamp. All timestamps are resolved against this one via:
  // timestampToTransmit = actualTimestamp - referenceTimestamp
  r: number,

  // The API key.
  k: string,

  // The trace ID of this beacon.
  t: string,

  // start timestamp in millis
  ts: number,

  // duration in millis
  d: number,

  [key: string]: ?number|?string
}

export interface PageLoadBeacon extends Beacon {
  // A backend trace ID when available
  bt: string,

  // Meta data
  m: string,

  // timing data available?
  tim: ShortBoolean,
  // redirect count
  t_red: number,
  // time to first byte
  t_fb: number,
  // time to first paint
  t_fp: number,

  // JSON-serialized resource timing trie
  res: string
}

export interface XhrBeacon extends Beacon {
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
