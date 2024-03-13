// @flow

import { sendBeacon as sendBatchedBeacon, isEnabled as isBatchingEnabled } from './batched';
import {createExcessiveUsageIdentifier} from '../excessiveUsageIdentification';
import { sendBeacon as sendFormEncodedBeacon } from './formEncoded';
import {isUrlIgnored} from '../ignoreRules';
import type {Beacon} from '../types';
import {info, error} from '../debug';

const isExcessiveUsage = createExcessiveUsageIdentifier({
  maxCalls: 8096,
  maxCallsPerTenMinutes: 4096,
  maxCallsPerTenSeconds: 128
});

export function sendBeacon(data: Partial<Beacon>) {
  if (isUrlIgnored(data['l'])) {
    // data['l'] is a standardized property across all beacons to ensure that we do not accidentally transmit data
    // about a page such as this.

    if (DEBUG) {
      info('Skipping transmission of beacon because document URL associated to the beacon is ignored by ignore rule.', data);
    }
    return;
  }

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
    if (isBatchingEnabled()) {
      sendBatchedBeacon(data);
    } else {
      sendFormEncodedBeacon(data);
    }
  } catch (e) {
    if (DEBUG) {
      error('Failed to transmit beacon', e);
    }
  }
}
