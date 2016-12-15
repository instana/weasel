// @flow

import {addEventListener, now} from '../util';
import type {Event} from '../types';
import {window} from '../browser';
import {emit} from '../eventBus';

const event: Event = {
  name: 'e:onLoad',
  time: null,
  initialize() {
    if (document.readyState === 'complete') {
      return onReady();
    }
    addEventListener(window, 'load', function() {
      // we want to get timing data for loadEventEnd,
      // so asynchronously process this
      setTimeout(onReady, 0);
    });
  }
};

function onReady() {
  event.time = now();
  emit(event.name, event.time);
}

export default event;
