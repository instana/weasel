// @flow

import {initialize} from './initialization';
import {log} from './debug';

if (DEBUG) {
  log('Initializing eum.');
}

initialize();
