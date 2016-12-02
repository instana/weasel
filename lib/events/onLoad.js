// @flow

import {addEventListener, now} from '../util';
import {emit} from '../eventBus';

var event: EumEvent = {
  name: 'e:onLoad',
  time: null,
  initialize: initialize
};

function initialize() {
  if (document.readyState === 'complete') {
    return onReady();
  }
  addEventListener(window, 'load', onReady);
}

function onReady() {
  event.time = now();
  emit(event.name, event.time);
}

export default event;
