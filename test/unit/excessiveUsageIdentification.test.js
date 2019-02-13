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
    isExcessiveUsage = createExcessiveUsageIdentifier({ maxCalls });

    for (let i = 0; i < maxCalls; i++) {
      expect(isExcessiveUsage()).to.equal(false);
    }
    expect(isExcessiveUsage()).to.equal(true);
    jest.runOnlyPendingTimers();
    expect(isExcessiveUsage()).to.equal(true);
  });

  it('must identify excessive usage per ten second window', () => {
    const maxCallsPerTenSecondWindow = 8;
    isExcessiveUsage = createExcessiveUsageIdentifier({
      maxCalls: Number.MAX_VALUE,
      maxCallsPerTenSeconds: maxCallsPerTenSecondWindow
    });

    for (let i = 0; i < maxCallsPerTenSecondWindow; i++) {
      expect(isExcessiveUsage()).to.equal(false);
    }
    expect(isExcessiveUsage()).to.equal(true);

    jest.runOnlyPendingTimers();
    for (let i = 0; i < maxCallsPerTenSecondWindow; i++) {
      expect(isExcessiveUsage()).to.equal(false);
    }
    expect(isExcessiveUsage()).to.equal(true);
  });
});
