// a wrapper around win.performance for cross-browser support
export const performance = {
  now() {
    return Date.now();
  }
};

export let isPerformanceObserverAvailable = true;
export function setPerformanceObserverAvailable(available: boolean) {
  isPerformanceObserverAvailable = available;
}

export function reset() {
  setPerformanceObserverAvailable(true);
}
