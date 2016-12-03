// @flow

import onLoadEvent from '../events/onLoad';
import {transitionTo} from '../fsm';
import type {State} from '../types';
import {on} from '../eventBus';

const state: State = {
  onEnter() {
    on(onLoadEvent.name, onLoad);
    onLoadEvent.initialize();
  }
};
export default state;

function onLoad() {
  transitionTo('pageLoaded');
}
