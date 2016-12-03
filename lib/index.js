// @flow

import waitForPageLoad from './states/waitForPageLoad';
import {registerState, transitionTo} from './fsm';
import pageLoaded from './states/pageLoaded';
import init from './states/init';

registerState('init', init);
registerState('waitForPageLoad', waitForPageLoad);
registerState('pageLoaded', pageLoaded);

transitionTo('init', init);
