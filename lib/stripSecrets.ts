// @flow

import { debug } from './debug';
import { matchesAny } from './util';
import vars from './vars';

let urlAnalysisElement: HTMLAnchorElement | null = null;

try {
  urlAnalysisElement = document.createElement('a');
} catch (e) {
  if (DEBUG) {
    debug('Failed to create URL analysis element. Will not be able to normalize URLs.', e);
  }
}

export function stripSecrets(url: string) {
  if (!url || url === '') {
    return url;
  }

  try {
    if (urlAnalysisElement) {
      urlAnalysisElement.href = url;
      url = urlAnalysisElement.href;
    }
    const queryIndex = url.indexOf('?');
    const hashIndex = url.indexOf('#');
    let fragString = null;

    if (hashIndex >= 0) {
      fragString = url
        .substring(hashIndex);
      if (url && matchesAny(vars.fragment, url)) {
        fragString = '#<redacted>';
      }
      url = url.substring(0, hashIndex);
    }

    if (queryIndex >= 0) {
      const queryString = url
        .substring(queryIndex)
        .split('&')
        .map(function (param) {
          const key = param.split('=')[0];
          if (key && matchesAny(vars.secrets, key)) {
            return key + '=<redacted>';
          }
          return param;
        }).join('&');

      url = url.substring(0, queryIndex) + queryString + (fragString ? fragString : '');
    }
  } catch (e) {
    if (DEBUG) {
      debug('Failed to strip secret from ' + url);
    }
  }

  return url;
}
