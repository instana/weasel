import { expect } from 'chai';

import { onUnhandledRejection, hookIntoGlobalUnhandledRejectionEvent } from '../../../lib/hooks/unhandledRejection';
import { getReportedErrors, clearReportedErrors } from '../../../lib/hooks/unhandledError';

jest.mock('../../../lib/hooks/unhandledError');

describe('asyncFunctionWrapping', () => {
  beforeEach(clearReportedErrors);

  describe('registration', () => {
    it('must observe unhandled rejections', () => {
      hookIntoGlobalUnhandledRejectionEvent();
      // window.PromiseRejectionEvent is unsupported by our current version of jsdom. As a result,
      // we are simulating it.
      // https://html.spec.whatwg.org/multipage/webappapis.html#promiserejectioneventinit
      const reason = new Error('foo');
      const event = new window.Event('unhandledrejection');
      event.reason = reason;
      window.dispatchEvent(event);
      expect(getReportedErrors()).to.have.lengthOf(1);
      expect(getReportedErrors()[0].message).to.have.a.string(reason.message);
      expect(getReportedErrors()[0].stack).to.equal(reason.stack);
    });
  });

  describe('reporting', () => {
    it('must support undefined reasons', () => {
      onUnhandledRejection({});
      expect(getReportedErrors()).to.have.lengthOf(1);
      expect(getReportedErrors()[0].message).to.match(/no reason defined/);
      expect(getReportedErrors()[0].stack).to.match(/unavailable/);
    });

    it('must support errors as reasons', () => {
      const error = new Error('Test error handling');
      onUnhandledRejection({
        reason: error
      });
      expect(getReportedErrors()).to.have.lengthOf(1);
      expect(getReportedErrors()[0].message).to.have.a.string(error.message);
      expect(getReportedErrors()[0].stack).to.equal(error.stack);
    });

    it('must support error like objects as reasons', () => {
      const error = {
        message: 'Test error handling'
      };
      onUnhandledRejection({
        reason: error
      });
      expect(getReportedErrors()).to.have.lengthOf(1);
      expect(getReportedErrors()[0].message).to.have.a.string(error.message);
      expect(getReportedErrors()[0].stack).to.match(/unavailable/);
    });

    it('must support error like objects with a stack as reasons', () => {
      const error = {
        message: 'Test error handling',
        stack: 'At foo:32'
      };
      onUnhandledRejection({
        reason: error
      });
      expect(getReportedErrors()).to.have.lengthOf(1);
      expect(getReportedErrors()[0].message).to.have.a.string(error.message);
      expect(getReportedErrors()[0].stack).to.equal(error.stack);
    });

    it('must support rejection with primitives', () => {
      const reason = 'Permutation fun';
      onUnhandledRejection({
        reason
      });
      expect(getReportedErrors()).to.have.lengthOf(1);
      expect(getReportedErrors()[0].message).to.have.a.string(reason);
      expect(getReportedErrors()[0].stack).to.match(/unavailable/);
    });
  });
});
