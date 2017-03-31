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
  ignoreUrls: RegExp[]
} = {
  nameOfLongGlobal: 'EumObject',
  pageLoadTraceId: generateUniqueId(),
  pageLoadBackendTraceId: null,
  referenceTimestamp: now(),
  highResTimestampReference: performance && performance.now ? performance.now() : 0,
  initializerExecutionTimestamp: now(),
  reportingUrl: null,
  apiKey: null,
  meta: {},
  ignoreUrls: []
};

export default defaultVars;
