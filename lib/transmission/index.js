// @flow

import { sendBeacon as sendBatchedJsonBeacon, isSupported as isBatchedJsonSupported } from './batchedJson';
import { sendBeacon as sendJsonBeacon, isSupported as isJsonSupported } from './json';
import {createExcessiveUsageIdentifier} from '../excessiveUsageIdentification';
import { sendBeacon as sendFormEncodedBeacon } from './formEncoded';
import type {Beacon} from '../types';
import {info, error} from '../debug';

export const jsonPayloadNativelySupported = isJsonSupported;

const isExcessiveUsage = createExcessiveUsageIdentifier({
  maxCalls: 1024,
  maxCallsPerTenSeconds: 128
});

export function sendBeacon(data: Beacon) {
  if (DEBUG) {
    info('Transmitting beacon', data);
  }

  if (isExcessiveUsage()) {
    if (DEBUG) {
      info('Reached the maximum number of beacons to transmit.');
    }
    return;
  }

  try {
    if (isBatchedJsonSupported) {
      sendBatchedJsonBeacon(data);
    } else if (isJsonSupported) {
      sendJsonBeacon(data);
    } else {
      sendFormEncodedBeacon(data);
    }
  } catch (e) {
    if (DEBUG) {
      error('Failed to transmit beacon', e);
    }
  }
}
