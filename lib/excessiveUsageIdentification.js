// @flow

export function createExcessiveUsageIdentifier(opts: {
  maxCalls?: number,
  maxCallsPerTenMinutes: number,
  maxCallsPerTenSeconds: number
}) {
  const maxCalls = opts.maxCalls || 4096;
  const maxCallsPerTenMinutes = opts.maxCallsPerTenMinutes || 128;
  const maxCallsPerTenSeconds = opts.maxCallsPerTenSeconds || 32;

  let totalCalls = 0;
  let totalCallsInLastTenMinutes = 0;
  let totalCallsInLastTenSeconds = 0;

  setInterval(function() {
    totalCallsInLastTenMinutes = 0;
  }, 1000 * 60 * 10);

  setInterval(function() {
    totalCallsInLastTenSeconds = 0;
  }, 1000 * 10);

  return function isExcessiveUsage() {
    return (
      ++totalCalls > maxCalls ||
      ++totalCallsInLastTenMinutes > maxCallsPerTenMinutes ||
      ++totalCallsInLastTenSeconds > maxCallsPerTenSeconds
    );
  };
}
