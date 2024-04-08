import { debug } from './debug';
import { win } from './browser';

// Asynchronously created a tag.
// document.createElement('a')
let urlAnalysisElement: HTMLAnchorElement | null = null;
let documentOriginAnalysisElement: HTMLAnchorElement | null = null;
try {
  urlAnalysisElement = document.createElement('a');
  documentOriginAnalysisElement = document.createElement('a');
  documentOriginAnalysisElement.href = win.location.href;
} catch (e) {
  if (DEBUG) {
    debug(
      'Failed to create URL analysis elements. Will not be able to execute same-origin check, i.e. all same-origin checks will fail.',
      e
    );
  }
}

export function isSameOrigin(url: string): boolean {
  if (!urlAnalysisElement || !documentOriginAnalysisElement) {
    return false;
  }

  try {
    urlAnalysisElement.href = url;

    return (
      // Most browsers support this fallback logic out of the box. Not so the Internet explorer.
      // To make it work in Internet explorer, we need to add the fallback manually.
      // IE 9 uses a colon as the protocol when no protocol is defined
      (urlAnalysisElement.protocol && urlAnalysisElement.protocol !== ':'
        ? urlAnalysisElement.protocol
        : documentOriginAnalysisElement.protocol) === documentOriginAnalysisElement.protocol &&
      (urlAnalysisElement.hostname || documentOriginAnalysisElement.hostname) === documentOriginAnalysisElement.hostname &&
      (urlAnalysisElement.port || documentOriginAnalysisElement.port) === documentOriginAnalysisElement.port
    );
  } catch (e) {
    return false;
  }
}
