// @flow

import {matchesAny} from './util';
import vars from './vars';

const dataUrlPrefix = 'data:';
const ignorePingsRegex = /.*\/ping(\/?$|\?.*)/i;

export function isUrlIgnored(url: ?string|?number): boolean {
  if (!url) {
    return true;
  }

  // Force string conversion. During runtime we have seen that some URLs passed into this code path aren't actually
  // strings. Reason currently unknown.
  url = String(url);
  if (!url) {
    return true;
  }

  // We never want to track data URLs. Instead of matching these via regular expressions (which might be expensive),
  // we are explicitly doing a startsWith ignore case check
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
  if (url.substring == null || url.substring(0, dataUrlPrefix.length).toLowerCase() === dataUrlPrefix) {
    return true;
  }

  if (vars.ignorePings && ignorePingsRegex.test(url)) {
    return true;
  }

  // Disable monitoring of data transmission requests. The data transmission strategy already ensures
  // that data transmission requests are not picked up internally. However we have seen some users
  // leverage custom (broken) XMLHttpRequest instrumentations to implement application code which
  // then break the detection of data transmission requests.
  if (vars.reportingUrl && (url === vars.reportingUrl || url === vars.reportingUrl + '/')) {
    return true;
  }

  return matchesAny(vars.ignoreUrls, url);
}

export function isErrorMessageIgnored(message: ?string) {
  return !message || matchesAny(vars.ignoreErrorMessages, message);
}
