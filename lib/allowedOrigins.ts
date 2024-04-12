import {matchesAny} from './util';
import vars from './vars';

export function isAllowedOrigin(url: string) {
  return matchesAny(vars.allowedOrigins, url);
}
