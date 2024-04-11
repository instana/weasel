import {win} from './browser';

// a wrapper around win.performance for cross-browser support
export const performance = (win as any)?.performance ||
  (win as any)?.webkitPerformance ||
  (win as any)?.msPerformance ||
  (win as any)?.mozPerformance;

export const isTimingAvailable = performance && performance?.timing;
export const isResourceTimingAvailable = performance && performance?.getEntriesByType;
export const isPerformanceObserverAvailable = performance &&
  typeof (win as any)['PerformanceObserver'] === 'function' &&
  typeof performance['now'] === 'function';
