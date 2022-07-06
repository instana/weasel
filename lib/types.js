// @flow
/* eslint-disable no-undef */

export type ShortBoolean = 0 | 1;

export type Meta = {
  [key: string]: ?string|?number
}

export type Event = {
  initialize: () => mixed,
  name: string,
  time: ?number
}

export type State = {
  onEnter: () => mixed,
  getActiveTraceId(): ?string,
  getActivePhase(): ?string
}

export type ReportingBackend = {
  reportingUrl: string,
  key: ?string
};

export interface Beacon {
  // The API key.
  k: string,

  // The version of the tracking snippet
  sv: ?string,

  // The trace ID of this beacon.
  t: string,

  // start timestamp in millis
  ts: number,

  // location, as in the whole URL from window.location.href
  l: string,

  // name of the page
  p: ?string,

  // currently active phase of the page (see phases)
  ph: ?string,

  // user id
  ui: ?string,

  // user name
  un: ?string,

  // user email address
  ue: ?string,

  // letter code for user preferred language, e.g. de, en-US
  ul: ?string,

  // Session ID
  sid: ?string,

  // window.innerWidth
  ww: ?number,

  // window.innerHeight
  wh: ?number,

  // Effective network connection type
  // https://wicg.github.io/netinfo/#dfn-effective-connection-type
  ct: ?string,

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
  t_fcp: number,
  t_lcp: number,
  t_pro: number,
  t_loa: number,
  t_ttfb: number,
  t_fid: number,
  t_cls: number
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

  // the ID of the page load
  pl: string,

  // method
  m: string,

  // url as specified in the user request. May not contain schema / host
  u: string,

  // async
  a: ShortBoolean,

  // status code
  st: number,

  // error message
  e: ?string,

  // Whether backend correlation was enabled for this XHR call
  bc: ShortBoolean,

  // A backend trace ID when available
  bt: ?string,

  // Whether the document was hidden at the time the request was initiated
  h: ShortBoolean,

  // GraphQL operation type
  got: ?string,
  // GraphQL operation name
  gon: ?string,

  // Resource timing data
  // https://www.w3.org/TR/resource-timing-2/#processing-model
  t_red: ?number,
  t_apc: ?number,
  t_dns: ?number,
  t_tcp: ?number,
  t_ssl: ?number,
  t_req: ?number,
  t_rsp: ?number,
  // TODO implement
  t_ttfb: ?number,
  s_ty: ?number,
  s_eb: ?number,
  s_db: ?number,
  s_ts: ?number,

  // HTTP header
  // h_abc: string,
  [key: string]: ?number|?string
}


export interface UnhandledErrorBeacon extends Beacon {
  ty: 'err',

  // span id
  s: string,

  // the ID of the page load
  pl: string,

  // error message
  e: string,

  // error stack
  st: string,

  // component stack
  cs: ?string,

  // how many times this error was seen since the last transmission
  c: number
}

export interface ReportErrorOpts {
  // for key based access to avoid global wrangling by closure compiler
  [key: string]: ?string|?Meta,

  componentStack: ?string,

  // Generally useful to have one-off meta data
  meta: ?Meta
}


export interface CustomEventBeacon extends Beacon {
  ty: 'cus',

  // event name
  n: string,

  // duration in millis
  d: ?number,

  // A backend trace ID when available
  bt: ?string,

  // error message
  e: ?string,
  // error stack
  st: ?string,
  // component stack
  cs: ?string
}

export interface CustomEventOptions {
  // To overwrite the default timestamp of the event. By default the
  // timestamp is `now() - duration`.
  timestamp: ?number,

  // In case the event is something that has spaned a time window.
  duration: ?number,

  // To be used for non-HTTP based backend communication, e.g.
  // custom WebSocket based RPC mechanisms.
  backendTraceId: ?string,

  // Used when integrating Weasel with log appenders
  error: ?ErrorLike,
  componentStack: ?string,

  // Generally useful to have one-off meta data
  meta: ?Meta,

  // to permit ['foo'] based access that doesn't break
  // when pushed through the Closure compiler
  [key: string]: any
}

export interface PageChangeBeacon extends Beacon {
  ty: 'pc',
}
