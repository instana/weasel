// a wrapper around win.performance for cross-browser support
export let performance = {
  now() {
    return Date.now();
  }
};

export let isPerformanceObserverAvailable = true;
export function setPerformanceObserverAvailable(available) {
  isPerformanceObserverAvailable = available;
}

export function reset() {
  setPerformanceObserverAvailable(true);
}
