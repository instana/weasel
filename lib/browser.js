// @flow

// aliasing globals for improved minifications

export const window: any = (function() {return this;})();
export const encodeURIComponent: string => string = window.encodeURIComponent;
