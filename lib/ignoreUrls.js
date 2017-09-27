// @flow

import vars from './vars';

const ignorePingsRegex = /.*\/ping(\/?$|\?.*)/i;

export function isUrlIgnored(url: string) {
  if (vars.ignorePings && ignorePingsRegex.test(url)) {
    return true;
  }

  for (let i = 0, len = vars.ignoreUrls.length; i < len; i++) {
    if (vars.ignoreUrls[i].test(url)) {
      return true;
    }
  }

  return false;
}
