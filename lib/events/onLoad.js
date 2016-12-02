// @flow

import type {Event} from '../types';
import {addEventListener, now} from '../util';
import {emit} from '../eventBus';

const event: Event = {
  name: 'e:onLoad',
  time: null,
  initialize() {
    if (document.readyState === 'complete') {
      return onReady();
    }
    addEventListener(window, 'load', onReady);
  }
};

function onReady() {
  event.time = now();
  emit(event.name, event.time);
}

export default event;
