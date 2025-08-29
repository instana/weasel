import { createExcessiveUsageIdentifier } from './excessiveUsageIdentification';
import { addCommonBeaconProperties, addInternalMetaDataToBeacon } from './commonBeaconProperties';
import { pageLoad as pageLoadPhase } from './phases';
import { sendBeacon } from './transmission/index';
import type { PageChangeBeacon } from './types';
import { getActivePhase } from './fsm';
import { info } from './debug';
import { now } from './util';
import vars from './vars';
import { getPageTransitionData, clearPageTransitionData } from './pageTransitionData';

type InternalMetaKey = 'view.title' | 'view.url';
export type InternalMeta = Partial<Record<InternalMetaKey, string>>;

const isExcessiveUsage = createExcessiveUsageIdentifier({
  maxCallsPerTenMinutes: 128,
  maxCallsPerTenSeconds: 32
});

export function setPage(page?: string, internalMeta?: InternalMeta): void {
  const previousPage = vars.page;
  vars.page = page;

  const isInitialPageDefinition = getActivePhase() === pageLoadPhase && previousPage == null;
  if (!isInitialPageDefinition && previousPage !== page) {
    if (isExcessiveUsage()) {
      if (DEBUG) {
        info('Reached the maximum number of page changes to monitor.');
      }
    } else {
      reportPageChange(internalMeta);
    }
  }
}

function reportPageChange(internalMeta?: InternalMeta): void {
  // Some properties deliberately left our for js file size reasons.
  const beacon: Partial<PageChangeBeacon> = {
    'ty': 'pc',
    'ts': now()
  };

  // Add page transition data to the beacon if available
  const transitionData = getPageTransitionData();

  if (transitionData.d !== undefined) {
    beacon['d'] = transitionData.d;
  }

  addCommonBeaconProperties(beacon);
  if (internalMeta) {
    addInternalMetaDataToBeacon(beacon, internalMeta);
  }

  // Clear the transition data after using it
  clearPageTransitionData();

  sendBeacon(beacon);
}
