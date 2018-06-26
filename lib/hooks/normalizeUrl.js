// @flow

import {debug} from '../debug';

// Asynchronously created a tag.
let urlAnalysisElement = null;

try {
  urlAnalysisElement = document.createElement('a');
} catch (e) {
  if (DEBUG) {
    debug('Failed to create URL analysis element. Will not be able to normalize URLs.', e);
  }
}

export function normalizeUrl(url: string): string {
  if (!urlAnalysisElement) {
    return url;
  }

  try {
    // "a"-elements normalize the URL when setting a relative URL or URLs
    // that are missing a scheme
    urlAnalysisElement.href = url;
    return urlAnalysisElement.href;
  } catch (e) {
    if (DEBUG) {
      debug('Failed to normalize URL' + url);
    }
    return url;
  }
}
