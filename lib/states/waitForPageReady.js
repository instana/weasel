import {transitionTo} from '../fsm';
import type {State} from '../types';
import {on} from '../eventBus';
import vars from '../vars';

const state: State = {
  onEnter() {
    on(vars.pageReadyEvent.name, onReady);
    vars.pageReadyEvent.initialize();
  }
};
export default state;

function onReady() {
  transitionTo('pageReady');
}
