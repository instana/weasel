// @flow

import {matchesAny} from './util';
import vars from './vars';

export function isWhitelistedOrigin(url: string) {
  return matchesAny(vars.whitelistedOrigins, url);
}
