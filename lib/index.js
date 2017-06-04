// @flow

import waitForPageLoad from './states/waitForPageLoad';
import {registerState, transitionTo} from './fsm';
import spaTransition from './states/spaTransition';
import pageLoaded from './states/pageLoaded';
import init from './states/init';

registerState('init', init);
registerState('waitForPageLoad', waitForPageLoad);
registerState('pageLoaded', pageLoaded);
registerState('spaTransition', spaTransition);

transitionTo('init');
