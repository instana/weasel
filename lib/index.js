// @flow

import waitForPageReady from './states/waitForPageReady';
import {registerState, transitionTo} from './fsm';
import init from './states/initialization';
import pageReady from './states/pageReady';

registerState('init', init);
registerState('waitForPageReady', waitForPageReady);
registerState('pageReady', pageReady);

transitionTo('init', init);
