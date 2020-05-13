// @flow

// $FlowFixMe Flow doesn't find the file. Let's ignore this for now.
import { getCLS, getLCP, getFID } from 'web-vitals/dist/web-vitals.es5.min.js';
import type {PageLoadBeacon} from './types';

interface Metric {
  name: 'CLS' | 'FID' | 'LCP',

  value: number
}

export function addWebVitals(beacon: PageLoadBeacon) {
  getLCP(onMetric, true);
  getFID(onMetric, true);
  getCLS(onMetricWithoutRounding, true);

  function onMetric(metric: Metric) {
    beacon['t_' + metric.name.toLocaleLowerCase()] = Math.round(metric.value);
  }

  function onMetricWithoutRounding(metric: Metric) {
    beacon['t_' + metric.name.toLocaleLowerCase()] = metric.value;
  }
}


