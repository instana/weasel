// @flow

export function createExcessiveUsageIdentifier(opts: {maxCalls: number, maxCallsPerTenSeconds: number}) {
  const maxCalls = opts.maxCalls || 512;
  const maxCallsPerTenSeconds = opts.maxCallsPerTenSeconds || 32;

  let totalCalls = 0;
  let totalCallsInLastTenSeconds = 0;

  setInterval(function() {
    totalCallsInLastTenSeconds = 0;
  }, 10000);

  return function isExcessiveUsage() {
    return ++totalCalls > maxCalls || ++totalCallsInLastTenSeconds > maxCallsPerTenSeconds;
  };
}
