// @flow

import {win} from './browser';

// a wrapper around win.performance for cross-browser support
export const performance = win.performance ||
  win.webkitPerformance ||
  win.msPerformance ||
  win.mozPerformance;

export const isTimingAvailable = performance && performance.timing;
export const isResourceTimingAvailable = performance && performance.getEntriesByType;
