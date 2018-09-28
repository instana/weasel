// @flow

import {generateUniqueId, now} from './util';
import {performance} from './performance';

type Meta = {
  [key: string]: string
}

const defaultVars: {
  // This is the global object name which the user of the EUM
  // product has no influence over. This should be chosen
  // wisely such that conflicts with other tools are highly
  // unlikely.
  nameOfLongGlobal: string,

  // The trace id of the page load. You should never need to
  // change this.
  pageLoadTraceId: string,

  // An optional trace ID to correlate the page load trace
  // to a backend trace.
  // Set via:
  // eum('traceId', '123');
  pageLoadBackendTraceId: ?string,

  // Name of the server timing entry under which the backend trace
  // ID can be found. Expects a server timing entry in the following
  // format.
  // PerformanceServerTiming {name: "intid", duration: 0, description: "1f27caa3493aeb"}
  serverTimingBackendTraceIdEntryName: string,

  // All timestamps which are part of beacons will be adjusted
  // using this timestamp before transmission to save some bytes.
  // So what we are doing is:
  // timestampToTransmit = actualTimestamp - referenceTimestamp
  referenceTimestamp: number,

  // High resolution reference point. Will be used to relate
  // high res timestamps to a value that client and server
  // understands.
  highResTimestampReference: number,

  // The time at which the EUM initializer was executed. Useful
  // to get a load time indicator for older devices.
  initializerExecutionTimestamp: number,

  // Changes the URL to which beacons will be send.
  // Change via
  // eum('reportingUrl', '//eum.example.com');
  reportingUrl: ?string,

  // Defines an application identification mechanism. This value
  // will always be transfered with every beacon to associate
  // requests with a monitored system.
  // Change via:
  // eum('apiKey', 'myKey');
  apiKey: ?string,

  // Defines user-configurable application payloads. These payloads
  // will be transfered with the page load beacon and should be a
  // Set meta data via:
  // eum('meta', 'key', 'value');
  meta: Meta,

  // An array of URLs for which no data should be collected. This
  // information is currently only respected for XHR data collection.
  // Set via:
  // eum('ignoreUrls', [/example.com/]);
  ignoreUrls: RegExp[],

  // Whether or not ping like requests should be ignored from AJAX
  // collection. This is separate from ignoreUrls to handle cases
  // where users start monitoring using weasel and generate tons
  // of beacons which look like
  // GET /ping
  // These types of beacons are often times not really helpful and
  // users typically only learn about these types of beacons after
  // they have monitored using weasel for some time. At that point,
  // this could have generated hundreds of thousands of beacons
  // that nobody is interested in.
  //
  // Set via:
  // eum('ignorePings', false);
  ignorePings: boolean,

  // Timeout for the transmission of XHR beacons.
  //
  // Set via:
  // eum('xhrTransmissionTimeout', 60000);
  xhrTransmissionTimeout: number,

  // Correlation headers can by default only be transmitted to the
  // origin of the document. This is the case because the same-origin
  // policy forbids a piece of JavaScript to send custom headers to
  // request to other origins. This results in a lack of
  // backend correlation which is especially bothersome when the
  // document is an SPA which is always gathering data from a different
  // origin.
  //
  // Custom headers can be enabled by leveraging CORS. With CORS,
  // the server can denote that the tracing headers are to be
  // allowed for cross-origin requests. The CORS specification
  // has more information about the header:
  //
  // https://www.w3.org/TR/cors/#access-control-allow-headers-response-header
  //
  // Example header for the Instana tracing headers:
  // Access-Control-Allow-Headers: X-INSTANA-T, X-INSTANA-S, X-INSTANA-L
  //
  // Next, the origin needs to be whitelisted via:
  // eum('whitelistedOrigins', [/.*shop.example.com/i]);
  //
  // The regular expressions will be matched against URLs.
  whitelistedOrigins: RegExp[],

  // Whether or not the page should be considered as loaded using the
  // page load event. False to indicate that page loads should be
  // manually managed.
  //
  // THIS IS HIGHLY DISCOURAGED!
  //
  // When using the mechanism, ensure that you manually trigger the
  // page load event.
  //
  // Usage:
  // Activate manual page load tracking:
  // eum('manualPageLoadEvent');
  //
  // Trigger the manual page load
  // eum('triggerPageLoad');
  manualPageLoadEvent: boolean,
  manualPageLoadTriggered: boolean,

  // Whether or not weasel should automatically clear the resource timing
  // buffer after collecting resource timing information. This is used to
  // ensure that the buffer always has sufficient capacity for new
  // resource timing entries.
  //
  // Change via:
  // eum('autoClearResourceTimings', true | false);
  autoClearResourceTimings: boolean,

  // Name of the page which the user is currently viewing. May be set as
  // part of the page load or later for SPA, XHR and error beacons.
  // Any string can be used as the page name. Try to keep it short though
  // for efficiency sake.
  //
  // Set via:
  // eum('page', 'myPageName');
  page: ?string,

  // Whether or not weasel should automatically wrap DOM event handlers
  // added via addEventlistener for improved uncaught error tracking.
  // This results in improved uncaught error tracking for cross-origin
  // errors, but may have adverse effects on website performance and
  // stability.
  //
  // Set via:
  // eum('wrapEventHandlers', true)
  wrapEventHandlers: boolean,

  // When wrapping event handlers (enabled only when wrapEventHandlers=true),
  // we will have to wrap user provided callbacks in addEventListener. This
  // wrapping is pretty straightforward in itself, but it becomes troublesome
  // due to removeEventListener. Within removeEventListener, we somehow must
  // map the original function to the mapped function. Otherwise, we would
  // break the applications.
  //
  // Not configurable externally. Overwrite by forking.
  wrappedEventHandlersOriginalFunctionStorageKey: string,

  // Whether or not weasel should automatically wrap timers
  // added via setTimeout / setInterval for improved uncaught error tracking.
  // This results in improved uncaught error tracking for cross-origin
  // errors, but may have adverse effects on website performance and
  // stability.
  //
  // Set via:
  // eum('wrapTimers', true)
  wrapTimers: boolean,

  // Weasel will send data either as HTTP GET requests with data being stored
  // in query parameters, or as HTTP POST requests with data being available
  // as the request body encoded as application/x-www-form-urlencoded.
  // Whether GET or POST is used depends on the amount of data. If the
  // length of the url exceeds the value of maxLengthForImgRequest and
  // the browser supports the XMLHttpRequest API, the request
  // will be sent as HTTP POST, otherwise as HTTP GET.
  //
  // Set via:
  // eum('maxLengthForImgRequest', 2000)
  maxLengthForImgRequest: number
} = {
  nameOfLongGlobal: 'EumObject',
  pageLoadTraceId: generateUniqueId(),
  pageLoadBackendTraceId: null,
  serverTimingBackendTraceIdEntryName: 'intid',
  referenceTimestamp: now(),
  highResTimestampReference: performance && performance.now ? performance.now() : 0,
  initializerExecutionTimestamp: now(),
  reportingUrl: null,
  apiKey: null,
  meta: {},
  ignoreUrls: [],
  ignorePings: true,
  xhrTransmissionTimeout: 20000,
  whitelistedOrigins: [],
  manualPageLoadEvent: false,
  manualPageLoadTriggered: false,
  autoClearResourceTimings: true,
  page: undefined,
  wrapEventHandlers: false,
  wrappedEventHandlersOriginalFunctionStorageKey: '__weaselOriginalFunctions__',
  wrapTimers: false,
  maxLengthForImgRequest: 2000
};

export default defaultVars;
