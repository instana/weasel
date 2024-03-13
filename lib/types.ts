// @flow

export type ShortBoolean = 0 | 1 | '0' | '1';

export type Meta = {
  [key: string]: string | number | null | undefined;
};

export type Event = {
  initialize: () => unknown;
  name: string;
  time?: number | null;
};

export type State = {
  onEnter: () => unknown;
  getActiveTraceId(): string | null | undefined;
  getActivePhase(): string | null | undefined;
};

export type ReportingBackend = {
  reportingUrl: string;
  key: string;
};

export interface Beacon {
  // The API key.
  k: string;

  // The version of the tracking snippet
  sv: string | null | undefined;

  // The trace ID of this beacon.
  t: string;

  // start timestamp in millis
  ts: number;

  // location, as in the whole URL from window.location.href
  l: string;

  // name of the page
  p: string | null | undefined;

  // currently active phase of the page (see phases)
  ph: string | null | undefined;

  // user id
  ui: string | null | undefined;

  // user name
  un: string | null | undefined;

  // user email address
  ue: string | null | undefined;

  // letter code for user preferred language, e.g. de, en-US
  ul: string | null | undefined;

  // Session ID
  sid: string | null | undefined;

  // window.innerWidth
  ww?: number;

  // window.innerHeight
  wh?: number;

  // Effective network connection type
  // https://wicg.github.io/netinfo/#dfn-effective-connection-type
  ct: string | null | undefined;

  // Meta data
  // m_abc: string,
  [key: string]: number | string | null | undefined;

  // Agent Version
  agv?: string;
}

export interface BeaconWithResourceTiming extends Beacon {
  // The reference timestamp. All timestamps are resolved against this one via:
  // timestampToTransmit = actualTimestamp - referenceTimestamp
  r: number;

  // JSON-serialized resource timing trie
  res: string;
}

export interface PageLoadBeacon extends Beacon, BeaconWithResourceTiming {
  ty: 'pl';

  // The reference timestamp. All timestamps are resolved against this one via:
  // timestampToTransmit = actualTimestamp - referenceTimestamp
  r: number;

  // duration in millis
  d: number;

  // A backend trace ID when available
  bt: string;

  // timing data available?
  tim: ShortBoolean;

  t_unl: number;
  t_red: number;
  t_apc: number;
  t_dns: number;
  t_tcp: number;
  t_ssl: number;
  t_req: number;
  t_rsp: number;
  t_dom: number;
  t_chi: number;
  t_bac: number;
  t_fro: number;
  t_fp: number;
  t_fcp: number;
  t_lcp: number;
  t_pro: number;
  t_loa: number;
  t_ttfb: number;
  t_fid: number;
  t_cls: number;
}

export interface XhrBeacon extends Beacon {
  // The reference timestamp. All timestamps are resolved against this one via:
  // timestampToTransmit = actualTimestamp - referenceTimestamp
  r: number;

  // duration in millis
  d: number;

  ty: 'xhr';

  // the span ID of this beacon
  s: string;

  // the ID of the page load
  pl: string;

  // method
  m: string;

  // url as specified in the user request. May not contain schema / host
  u: string;

  // async
  a: ShortBoolean;

  // status code
  st: number;

  // error message
  e: string | null | undefined;

  // Whether backend correlation was enabled for this XHR call
  bc: ShortBoolean;

  // A backend trace ID when available
  bt: string | null | undefined;

  // Whether the document was hidden at the time the request was initiated
  h: ShortBoolean;

  // GraphQL operation type
  got: string | null | undefined;
  // GraphQL operation name
  gon: string | null | undefined;

  // Resource timing data
  // https://www.w3.org/TR/resource-timing-2/#processing-model
  t_red?: number;
  t_apc?: number;
  t_dns?: number;
  t_tcp?: number;
  t_ssl?: number;
  t_req?: number;
  t_rsp?: number;
  // TODO implement
  t_ttfb?: number;
  s_ty?: number;
  s_eb?: number;
  s_db?: number;
  s_ts?: number;

  // HTTP header
  // h_abc: string;
  [key: string]: number | string | null | undefined;
}

export interface UnhandledErrorBeacon extends Beacon {
  ty: 'err';

  // span id
  s: string;

  // the ID of the page load
  pl: string;

  // error message
  e: string;

  // error stack
  st: string;

  // component stack
  cs: string | null | undefined;

  // how many times this error was seen since the last transmission
  c: number;
}

export interface ReportErrorOpts {
  // for key based access to avoid global wrangling by closure compiler
  [key: string]: string | null | undefined | Meta;

  componentStack: string | null | undefined;

  // Generally useful to have one-off meta data
  meta?: Meta;
}

export interface CustomEventBeacon extends Beacon {
  ty: 'cus';

  // event name
  n: string;

  // duration in millis
  d?: number;

  // A backend trace ID when available
  bt: string | null | undefined;

  // error message
  e: string | null | undefined;
  // error stack
  st: string | null | undefined;
  // component stack
  cs: string | null | undefined;

  //custom metric
  cm?: number;
}

export interface CustomEventOptions {
  // To overwrite the default timestamp of the event. By default the
  // timestamp is `now() - duration`.
  timestamp?: number;

  // In case the event is something that has spaned a time window.
  duration?: number;

  // To be used for non-HTTP based backend communication, e.g.
  // custom WebSocket based RPC mechanisms.
  backendTraceId: string | null | undefined;

  // Used when integrating Weasel with log appenders
  error?: ErrorLike;
  componentStack: string | null | undefined;

  // Generally useful to have one-off meta data
  meta?: Meta;

  // to permit ['foo'] based access that doesn't break
  // when pushed through the Closure compiler
  [key: string]: any;

  // Any custom metric that can be passed with custom events Example: 123.2342
  customMetric?: number;
}

export interface PageChangeBeacon extends Beacon {
  ty: 'pc';
}
