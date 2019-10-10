// @flow

import {createExcessiveUsageIdentifier} from './excessiveUsageIdentification';
import {addCommonBeaconProperties} from './commonBeaconProperties';
import {pageLoad as pageLoadPhase} from './phases';
import {sendBeacon} from './transmission/index';
import type {PageChangeBeacon} from './types';
import {getActivePhase} from './fsm';
import {info} from './debug';
import {now} from './util';
import vars from './vars';

const isExcessiveUsage = createExcessiveUsageIdentifier({
  maxCalls: 512,
  maxCallsPerTenSeconds: 32
});

export function setPage(page: ?string): void {
  const previousPage = vars.page;
  vars.page = page;

  const isInitialPageDefinition = getActivePhase() === pageLoadPhase && previousPage == null;
  if (!isInitialPageDefinition && previousPage !== page) {
    if (isExcessiveUsage()) {
      if (DEBUG) {
        info('Reached the maximum number of page changes to monitor.');
      }
    } else {
      reportPageChange();
    }
  }
}

function reportPageChange(): void {
  // $FlowFixMe: Some properties deliberately left our for js file size reasons.
  const beacon: PageChangeBeacon = {
    'ty': 'pc',
    'ts': now()
  };
  addCommonBeaconProperties(beacon);
  sendBeacon(beacon);
}
