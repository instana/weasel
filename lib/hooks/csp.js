// @flow

import {createExcessiveUsageIdentifier} from '../excessiveUsageIdentification';
import {addCommonBeaconProperties} from '../commonBeaconProperties';
import type {ContentSecurityPolicyViolationBeacon} from '../types';
import {sendBeacon} from '../transmission/index';
import {addEventListener, now} from '../util';
import {doc, win} from '../browser';
import {info} from '../debug';
import vars from '../vars';

const isExcessiveUsage = createExcessiveUsageIdentifier({
  maxCalls: 64,
  maxCallsPerTenSeconds: 32
});

export function observeCspViolations() {
  if (vars.collectCspViolations) {
    addEventListener(doc, 'securitypolicyviolation', onViolation);
  }
}

function onViolation(e: Event) {
  if (isExcessiveUsage()) {
    if (DEBUG) {
      info('Reached the maximum number of Content-Security Policy violations to monitor.');
    }
    return;
  }

  // $FlowFixMe: Some properties deliberately left our for js file size reasons.
  const beacon: ContentSecurityPolicyViolationBeacon = {
    'ty': 'csp',
    'ts': now(),
    'l': win.location.href,

    // $FlowFixMe
    'bu': e['blockedURI'],
    // $FlowFixMe
    'ed': e['effectiveDirective'],
    // $FlowFixMe
    'vd': e['violatedDirective'],
    // $FlowFixMe
    'op': e['originalPolicy'],
    // $FlowFixMe
    'di': e['disposition'],
    // $FlowFixMe
    'st': e['statusCode'],
    // $FlowFixMe
    'sa': e['sample'],
    // $FlowFixMe
    'sf': e['sourceFile']
  };

  // $FlowFixMe
  if (e['lineNumber']) {
    // $FlowFixMe
    beacon['ln'] = e['lineNumber'];
  }

  // $FlowFixMe
  if (e['columnNumber']) {
    // $FlowFixMe
    beacon['cn'] = e['columnNumber'];
  }

  addCommonBeaconProperties(beacon);
  sendBeacon(beacon);
}
