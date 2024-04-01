// @flow

// $FlowFixMe Flow doesn't find the file. Let's ignore this for now.
import {onCLS, onLCP, onFID, onINP} from 'web-vitals';
import type {PageLoadBeacon} from './types';
import {pageLoadStartTimestamp} from './timings';
import {reportCustomEvent} from './customEvents';
import vars from './vars';

interface Metric {
  name: 'CLS' | 'FID' | 'LCP' | 'INP';

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
    'duration': Math.round(metric.value),
    'meta': {
      'id': metric.id,
      'v': metric.value
    }
  });
}

export function addWebVitals(beacon: Partial<PageLoadBeacon>) {
  if (onLCP) {
    onLCP(onMetric, { reportAllChanges: true });
  }
  if (onFID) {
    onFID(onMetric, { reportAllChanges: true });
  }
  if (onINP) {
    onINP(onMetric, { reportAllChanges: true });
  }
  if (onCLS) {
    onCLS(onMetricWithoutRounding, { reportAllChanges: true });
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
