import {debug} from '../debug';

const maximumHttpRequestUrlLength = 4096;

// Asynchronously created a tag.
let urlAnalysisElement: HTMLAnchorElement | null = null;

try {
  urlAnalysisElement = document.createElement('a');
} catch (e) {
  if (DEBUG) {
    debug('Failed to create URL analysis element. Will not be able to normalize URLs.', e);
  }
}

export function normalizeUrl(url: string, includeHash?: boolean): string {
  if (urlAnalysisElement) {
    try {
      // "a"-elements normalize the URL when setting a relative URL or URLs
      // that are missing a scheme
      urlAnalysisElement.href = url;
      url = urlAnalysisElement.href;
    } catch (e) {
      if (DEBUG) {
        debug('Failed to normalize URL' + url);
      }
    }
  }

  // in case of view detection, we still user a chance to extract useful information from hash strings
  if (!includeHash) {
    // Hashes are never transmitted to the server and they are also not included in resource
    // timings. Do not include them in the normalized URL.
    const hashIndex = url.indexOf('#');
    if (hashIndex >= 0) {
      url = url.substring(0, hashIndex);
    }
  }

  if (url.length > maximumHttpRequestUrlLength) {
    url = url.substring(0, maximumHttpRequestUrlLength);
  }

  return url;
}
