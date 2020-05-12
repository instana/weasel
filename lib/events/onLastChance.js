// @flow

import { addEventListener } from '../util';
import { doc, win } from '../browser';

// Defined here until https://github.com/facebook/flow/pull/8371 is merged and released.
class PageTransitionEvent extends Event {
  persisted: boolean;
}

let isUnloading = false;

export function onLastChance(fn: Function) {
  if (isUnloading) {
    fn();
  }

  addEventListener(doc, 'visibilitychange', function() {
    if (doc.visibilityState !== 'visible') {
      fn();
    }
  });

  // $FlowFixMe The type is correct, but flow doesn't think so. Ignore for now.
  addEventListener(win, 'pagehide', function(event: PageTransitionEvent) {
    if (event.persisted) {
      isUnloading = true;
      fn();
    }
  });

  // Unload is needed to fix this bug:
  // https://bugs.chromium.org/p/chromium/issues/detail?id=987409
  addEventListener(win, 'unload', function() {});

  // According to the spec visibilitychange should be a replacement for
  // beforeunload, but the reality is different (as of 2019-04-17). Chrome will
  // close tabs without firing visibilitychange. beforeunload on the other hand
  // is fired.
  addEventListener(win, 'beforeunload', function() {
    isUnloading = true;
    fn();
  });
}
