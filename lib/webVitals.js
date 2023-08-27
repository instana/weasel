// @flow

// $FlowFixMe Flow doesn't find the file. Let's ignore this for now.
import {getCLS, getLCP, getFID} from 'web-vitals/dist/web-vitals.js';
import type {PageLoadBeacon} from './types';
import {pageLoadStartTimestamp} from './timings';
import {reportCustomEvent} from './customEvents';
import vars from './vars';

interface Metric {
  name: 'CLS' | 'FID' | 'LCP';

  value: number;
  id?: string;
}

function reportExtraMetrics(metric: Metric) {
  if (!vars.webvitalsInCustomEvent) {
    return;
  }

  // $FlowFixMe: Flow cannot detect that this is a proper usage of the function. We have to write it this way because of the Closure compiler advanced mode.
  reportCustomEvent('instana-webvitals-' + metric.name, {
    'timestamp': pageLoadStartTimestamp + Math.round(metric.value),
    'duration': metric.value,
    'meta': {
      'id': metric.id
    }
  });
}

export function addWebVitals(beacon: PageLoadBeacon) {
  if (getLCP) {
    getLCP(onMetric, true);
  }
  if (getFID) {
    getFID(onMetric, true);
  }
  if (getCLS) {
    getCLS(onMetricWithoutRounding, true);
  }

  function onMetric(metric: Metric) {
    beacon['t_' + metric.name.toLocaleLowerCase()] = Math.round(metric.value);
    reportExtraMetrics(metric);
  }

  function onMetricWithoutRounding(metric: Metric) {
    beacon['t_' + metric.name.toLocaleLowerCase()] = metric.value;
    reportExtraMetrics(metric);
  }
}
