// @flow

// $FlowFixMe Flow doesn't find the file. Let's ignore this for now.
import { getCLS, getLCP, getFID } from 'web-vitals/dist/web-vitals.es5.min.js';
import type {PageLoadBeacon} from './types';

interface Metric {
  name: 'CLS' | 'FID' | 'LCP',

  value: number,

  isFinal: boolean
}

export function addWebVitals(beacon: PageLoadBeacon, callback: Function) {
  let remainingFinalMetrics = 3;

  getLCP(onMetric, true);
  getFID(onMetric, true);
  getCLS(onMetric, true);

  function onMetric(metric: Metric) {
    beacon['t_' + metric.name.toLocaleLowerCase()] = Math.round(metric.value);

    if (metric.isFinal) {
      remainingFinalMetrics--;
    }

    if (remainingFinalMetrics < 1) {
      callback();
    }
  }
}


