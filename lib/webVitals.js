// @flow

// $FlowFixMe Flow doesn't find the file. Let's ignore this for now.
import {onLCP} from 'web-vitals';
import type {PageLoadBeacon} from './types';
import {pageLoadStartTimestamp} from './timings';
import {reportCustomEvent} from './customEvents';
import vars from './vars';

interface Metric {
  name: 'LCP';

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

export function addWebVitals(beacon: PageLoadBeacon) {
  if (onLCP) {
    onLCP(onMetric, true);
  }
  // if (onFID) {
  //   onFID(onMetric, true);
  // }
  // if (onINP) {
  //   onINP(onMetric, true);
  // }
  // if (onCLS) {
  //   onCLS(onMetricWithoutRounding, true);
  // }

  function onMetric(metric: Metric) {
    beacon['t_' + metric.name.toLocaleLowerCase()] = Math.round(metric.value);
    reportExtraMetrics(metric);
  }

  // function onMetricWithoutRounding(metric: Metric) {
  //   beacon['t_' + metric.name.toLocaleLowerCase()] = metric.value;
  //   reportExtraMetrics(metric);
  // }
}
