//import { isTransmitionRequest } from './transmission/util';
import {matchesAny} from './util';
import vars from './vars';

//const dataUrlPrefix = 'data:';
//const ignorePingsRegex = /.*\/ping(\/?$|\?.*)/i;

export function isQueryTracked(url?: string | number | null): boolean {
  if (!url) {
    return true;
  }

  if (url === null) {
    return true;
  }

  url = String(url);
  if (!url) {
    return true;
  }

  // Track entire url including parameters if queryTrackedDomainList is empty
  if(vars.queryTrackedDomainList.length === 0){
    return true;
  }

  // queryTrackedDomainList contains list of url whose query parameters and fragment string should not be excluded
  // from tracking
  return matchesAny(vars.queryTrackedDomainList, url);
}

export function removeQueryAndFragmentFromUrl(url?: string | number | null): string {
  if (!url) {
    return '';
  }

  if (url === null) {
    return '';
  }

  // Force string conversion. During runtime we have seen that some URLs passed into this code path aren't actually
  // strings. Reason currently unknown.

  url = String(url);
  if (!url) {
    return '';
  }

  const parsedUrl = new URL(url);
  parsedUrl.search = '';
  parsedUrl.hash = '';
  return parsedUrl.toString();
}

