import vars from '../vars';

/*
 * This file exists to resolve circular dependencies between
 * lib/transmission/index.js -> lib/transmission/batched.js -> lib/hooks/XMLHttpRequest.js -> lib/transmission/index.js
 */

export function disableMonitoringForXMLHttpRequest(xhr: XMLHttpRequest): void {
  const state = xhr[vars.secretPropertyKey] = xhr[vars.secretPropertyKey] || {};
  state.ignored = true;
}
