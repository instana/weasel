// @flow

import {matchesAny} from './util';
import vars from './vars';

const dataUrlPrefix = 'data:';
const ignorePingsRegex = /.*\/ping(\/?$|\?.*)/i;

export function isUrlIgnored(url: string) {
  if (!url) {
    return true;
  }

  // We never want to track data URLs. Instead of matching these via regular expressions (which might be expensive),
  // we are explicitly doing a startsWith ignore case check
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
  if (url.substring(0, dataUrlPrefix.length).toLowerCase() === dataUrlPrefix) {
    return true;
  }

  if (vars.ignorePings && ignorePingsRegex.test(url)) {
    return true;
  }

  return matchesAny(vars.ignoreUrls, url);
}

export function isErrorMessageIgnored(message: ?string) {
  return !message || matchesAny(vars.ignoreErrorMessages, message);
}
