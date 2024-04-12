import { addEventListener } from '../util';
import { doc, win } from '../browser';

let isUnloading = false;

export function onLastChance(fn: () => void) {
  if (isUnloading) {
    fn();
  }

  addEventListener(doc, 'visibilitychange', function() {
    if (doc.visibilityState !== 'visible') {
      fn();
    }
  });

  addEventListener(win, 'pagehide', function() {
    isUnloading = true;
    fn();
  });

  // According to the spec visibilitychange should be a replacement for
  // beforeunload, but the reality is different (as of 2019-04-17). Chrome will
  // close tabs without firing visibilitychange. beforeunload on the other hand
  // is fired.
  addEventListener(win, 'beforeunload', function() {
    isUnloading = true;
    fn();
  });
}
