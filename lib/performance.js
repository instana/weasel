// @flow

// a wrapper around window.performance for cross-browser support
export const performance = window.performance ||
  window.webkitPerformance ||
  window.msPerformance ||
  window.mozPerformance;

export const isTimingAvailable = performance && performance.timing;
export const isResourceTimingAvailable = performance && performance.getEntriesByType;
