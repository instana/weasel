// @flow

import {matchesAny} from './util';
import vars from './vars';

const ignorePingsRegex = /.*\/ping(\/?$|\?.*)/i;

export function isUrlIgnored(url: string) {
  if (vars.ignorePings && ignorePingsRegex.test(url)) {
    return true;
  }

  return matchesAny(vars.ignoreUrls, url);
}
