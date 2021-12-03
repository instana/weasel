// @flow

import {generateUniqueId, now} from './util';
import {performance} from './performance';
import type {Meta} from './types';

const defaultVars: {
  // This is the global object name which the user of the EUM
  // product has no influence over. This should be chosen
  // wisely such that conflicts with other tools are highly
  // unlikely.
  nameOfLongGlobal: string,

  // The version of the snippet loading/initializing Weasel.
  // This value is automatically retrieved from the global
  // object's `v` field.
  trackingSnippetVersion: ?string,

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

  // The number of milliseconds to potentially wait to batch beacons
  // into a single request.
  // Change via
  // eum('beaconBatchingTime', 1000);
  beaconBatchingTime: number,

  // How long to wait after an XMLHttpRequest or fetch request has finished
  // for the retrieval of resource timing data. Performance timeline events
  // are placed on the low priority task queue and therefore high values
  // might be necessary.
  //
  // Change via:
  // eum('maxWaitForResourceTimingsMillis', 5000);
  maxWaitForResourceTimingsMillis: number,

  // Weasel will wait up to this many milliseconds after the onLoad event
  // completes for any additional metrics related to the page load, e.g.
  // first input delay or cumulative layout shift. Additional waiting time
  // means that:
  //
  //  1. Data is seen later within the monitoring system and
  //  2. that data could theoretically be lost.
  //
  // Change via:
  // eum('maxMaitForPageLoadMetricsMillis', 2000);
  maxMaitForPageLoadMetricsMillis: number,

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

  // An array of URL regular expression for which no data should be
  // collected. These regular expressions are evaluated against
  // the document, XMLHttpRequest, fetch and resource URLs.
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

  // An array of error message regular expressions for which no data
  // should be collected.
  // Set via:
  // eum('ignoreErrorMessages', [/script error/i]);
  ignoreErrorMessages: RegExp[],

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
  // Next, the origin needs to be allowed via:
  // eum('allowedOrigins', [/.*shop.example.com/i]);
  //
  // The regular expressions will be matched against URLs.
  allowedOrigins: RegExp[],

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

  // This key will be used by Weasel to privately store data on objects.
  // Make sure to change this key when deploying Weasel in production.
  secretPropertyKey: string,

  // Weasel will not attempt automatic user tracking via cookies,
  // fingerprinting or any other means. Instead, we give users the
  // ability manually define user identifying properties. This means
  // that Weasel can adapt to various data security & privacy
  // settings.
  //
  // Set via:
  // eum('user', 'userId', 'user name', 'email')
  userId: ?string,
  userName: ?string,
  userEmail: ?string,

  // Weasel by default does not collect session information as this
  // has privacy policy implications. The session ID is a random
  // value and does not make use of any fingerprinting mechanisms!
  //
  // Enable via:
  // eum(
  //   'trackSessions',
  //   sessionInactivityTimeoutMillis: ?number = 21600000,  // six hours
  //   sessionTerminationTimeoutMillis: ?number = 21600000  // six hours
  // )
  sessionId: ?string,

  // Information about sessions will be stored under this name in
  // localStorage or cookies whenever allowed by calling trackSessions.
  //
  // This value cannot be changed at runtime.
  sessionStorageKey: string,

  // The default session inactivity timeout. Session inactivity is the maximum
  // allowed time to pass between two page loads before the session is considered
  // to be expired. Also think of cache time-to-idle configuration options.
  //
  // This value cannot be changed at runtime.
  defaultSessionInactivityTimeoutMillis: number,

  // The default session termination timeout. Session termination is the maximum
  // allowed time to pass since session start before the session is considered
  // to be expired. Also think of cache time-to-live configuration options.
  //
  // This value cannot be changed at runtime.
  defaultSessionTerminationTimeoutMillis: number,

  // The maximum allowed value for either all session timeouts. Users can overwrite
  // the defaults on a per page-load basis. We want to avoid abuse by protecting
  // end-user from (near-) infinite timeouts.
  //
  // This value cannot be changed at runtime.
  maxAllowedSessionTimeoutMillis: number,

  // A set of regular expressions that will be matched against user timing
  // mark and measure names. When any of the regular expressions match, then
  // the user timing value will not be collected.
  //
  // eum('ignoreUserTimings', [/^\u269B/, /^\u26D4/]);
  ignoreUserTimings: RegExp[],

  // A set of regular expressions that will be matched against the first parameter
  // of the `fetch` API, i.e. the relative or absolute request URL. By configuring
  // this, you can decide which URLs Weasel we analyze for GraphQL specifics.
  //
  // eum('urlsToCheckForGraphQlInsights', [/\/graphql/i]);
  urlsToCheckForGraphQlInsights: RegExp[],

  // A set of regular expression that will be matched against query parameters
  // in any URL that collected. When matched, value of the query parameter will be
  // set to <redacted>. By configuring this, data treated as secrets will not reach
  // the backend for processing, thus, will not be available for analysis in the UI
  // or retrieval via API. By default, 'key', 'password' and 'secret' query
  // parameters are treated as secret data.
  //
  // eum('secrets',  [/mysecret/i]);
  secrets: RegExp[]
} = {
  nameOfLongGlobal: 'EumObject',
  trackingSnippetVersion: null,
  pageLoadTraceId: generateUniqueId(),
  pageLoadBackendTraceId: null,
  serverTimingBackendTraceIdEntryName: 'intid',
  referenceTimestamp: now(),
  highResTimestampReference: performance && performance.now ? performance.now() : 0,
  initializerExecutionTimestamp: now(),
  reportingUrl: null,
  beaconBatchingTime: 500,
  maxWaitForResourceTimingsMillis: 10000,
  maxMaitForPageLoadMetricsMillis: 5000,
  apiKey: null,
  meta: {},
  ignoreUrls: [],
  ignorePings: true,
  ignoreErrorMessages: [],
  xhrTransmissionTimeout: 20000,
  allowedOrigins: [],
  page: undefined,
  wrapEventHandlers: false,
  wrappedEventHandlersOriginalFunctionStorageKey: '__weaselOriginalFunctions__',
  wrapTimers: false,
  secretPropertyKey: '__weaselSecretData__',
  userId: undefined,
  userName: undefined,
  userEmail: undefined,
  sessionId: undefined,
  sessionStorageKey: 'session',
  defaultSessionInactivityTimeoutMillis: 1000 * 60 * 60 * 3,
  defaultSessionTerminationTimeoutMillis: 1000 * 60 * 60 * 6,
  maxAllowedSessionTimeoutMillis:  1000 * 60 * 60 * 24,
  // The default ignore rules cover specific React and Angular patterns:
  //
  // React has a whole lot of user timings. Luckily all of them start with
  // the emojis for easy filtering. Let's ignore them by default as most of
  // them won't be valuable to many of our users (in production).
  //
  // Similar for Angular which uses zones with a ton of custom user
  // timings. https://angular.io/guide/zone
  //
  // We have also seen people use 'start xyz' / 'end xyz' as a common pattern to
  // name marks used to create measures. This is surely not a comprehensive
  // solution to identify these cases, but should for now be sufficient.
  ignoreUserTimings: [/^\u269B/, /^\u26D4/, /^Zone(:|$)/, /^start /i, /^end /i],
  urlsToCheckForGraphQlInsights: [/\/graphql/i],
  secrets: [/key/i, /password/i, /secret/i]
};

export default defaultVars;
