// @flow

import { sendBeacon as sendBatchedBeacon, isSupported as isBatchedSupported } from './batched';
import {createExcessiveUsageIdentifier} from '../excessiveUsageIdentification';
import { sendBeacon as sendFormEncodedBeacon } from './formEncoded';
import type {Beacon} from '../types';
import {info, error} from '../debug';

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
    if (isBatchedSupported) {
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
