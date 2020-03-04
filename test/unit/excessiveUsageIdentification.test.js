import { expect } from 'chai';

import { createExcessiveUsageIdentifier } from '../../lib/excessiveUsageIdentification';

jest.useFakeTimers();

describe('excessiveUsageIdentification', () => {
  let isExcessiveUsage;

  beforeEach(() => {
    isExcessiveUsage = null;
  });

  it('must identify excessive usage once the maximum call count is eached', () => {
    const maxCalls = 8;
    isExcessiveUsage = createExcessiveUsageIdentifier({
      maxCalls,
      maxCallsPerTenMinutes: Number.MAX_VALUE,
      maxCallsPerTenSeconds: Number.MAX_VALUE
    });

    for (let i = 0; i < maxCalls; i++) {
      expect(isExcessiveUsage()).to.equal(false);
    }
    expect(isExcessiveUsage()).to.equal(true);
    jest.runOnlyPendingTimers();
    expect(isExcessiveUsage()).to.equal(true);
  });

  it('must identify excessive usage per ten minute window', () => {
    const maxCallsPerTenMinutes = 8;
    isExcessiveUsage = createExcessiveUsageIdentifier({
      maxCalls: Number.MAX_VALUE,
      maxCallsPerTenMinutes,
      maxCallsPerTenSeconds: Number.MAX_VALUE
    });

    for (let i = 0; i < maxCallsPerTenMinutes; i++) {
      expect(isExcessiveUsage()).to.equal(false);
    }
    expect(isExcessiveUsage()).to.equal(true);

    jest.runOnlyPendingTimers();
    for (let i = 0; i < maxCallsPerTenMinutes; i++) {
      expect(isExcessiveUsage()).to.equal(false);
    }
    expect(isExcessiveUsage()).to.equal(true);
  });

  it('must identify excessive usage per ten second window', () => {
    const maxCallsPerTenSeconds = 8;
    isExcessiveUsage = createExcessiveUsageIdentifier({
      maxCalls: Number.MAX_VALUE,
      maxCallsPerTenMinutes: Number.MAX_VALUE,
      maxCallsPerTenSeconds
    });

    for (let i = 0; i < maxCallsPerTenSeconds; i++) {
      expect(isExcessiveUsage()).to.equal(false);
    }
    expect(isExcessiveUsage()).to.equal(true);

    jest.runOnlyPendingTimers();
    for (let i = 0; i < maxCallsPerTenSeconds; i++) {
      expect(isExcessiveUsage()).to.equal(false);
    }
    expect(isExcessiveUsage()).to.equal(true);
  });
});
