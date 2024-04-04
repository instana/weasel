// @flow

import {addEventListener, now} from '../util';
import {setTimeout} from '../timers';
import type {Event} from '../types';
import {emit} from '../eventBus';
import {win} from '../browser';

const event: Event = {
  name: 'e:onLoad',
  time: null,
  initialize() {
    if (document?.readyState === 'complete') {
      return onReady();
    }
    addEventListener(win, 'load', function() {
      // we want to get timing data for loadEventEnd,
      // so asynchronously process this
      setTimeout(onReady, 0);
    });
  }
};

function onReady() {
  event.time = now();
  emit(event?.name, event?.time);
}

export default event;
