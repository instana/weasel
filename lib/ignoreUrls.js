// @flow

import vars from './vars';

export function isUrlIgnored(url: string) {
  for (let i = 0, len = vars.ignoreUrls.length; i < len; i++) {
    if (vars.ignoreUrls[i].test(url)) {
      return true;
    }
  }
  return false;
}
