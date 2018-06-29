import { expect } from 'chai';

import {
  getDomEventListenerCaptureValue,
  addWrappedFunction,
  popWrappedFunction,
  addWrappedDomEventListener,
  popWrappedDomEventListener
} from '../../lib/asyncFunctionWrapping';

const wrapped = () => {};
const wrapped2 = () => {};
const original = () => {};

describe('asyncFunctionWrapping', () => {
  let eventTarget;

  beforeEach(() => {
    eventTarget = {};
  });

  describe('getDomEventListenerCaptureValue', () => {
    it('must identify capture values', () => {
      expect(getDomEventListenerCaptureValue(true)).to.equal(true);
      expect(getDomEventListenerCaptureValue({ capture: true })).to.equal(true);
      expect(getDomEventListenerCaptureValue('foo')).to.equal(true);
      expect(getDomEventListenerCaptureValue(42)).to.equal(true);
      expect(getDomEventListenerCaptureValue({ capture: 'foo' })).to.equal(true);
      expect(getDomEventListenerCaptureValue({ capture: 42 })).to.equal(true);

      expect(getDomEventListenerCaptureValue(false)).to.equal(false);
      expect(getDomEventListenerCaptureValue(null)).to.equal(false);
      expect(getDomEventListenerCaptureValue(undefined)).to.equal(false);
      expect(getDomEventListenerCaptureValue({ capture: false })).to.equal(false);
      expect(getDomEventListenerCaptureValue({ capture: null })).to.equal(false);
      expect(getDomEventListenerCaptureValue({ capture: undefined })).to.equal(false);
      expect(getDomEventListenerCaptureValue({})).to.equal(false);
    });
  });

  describe('addWrappedFunction / popWrappedFunction', () => {
    it('must support simple one add / one pop', () => {
      expect(addWrappedFunction(eventTarget, wrapped, [original])).to.equal(wrapped);
      expect(popWrappedFunction(eventTarget, [original])).to.equal(wrapped);
      expect(popWrappedFunction(eventTarget, [original])).to.equal(undefined);
      expect(popWrappedFunction(eventTarget, [original], original)).to.equal(original);
    });

    it('must not allow duplicate registration', () => {
      expect(addWrappedFunction(eventTarget, wrapped, [original])).to.equal(wrapped);
      expect(addWrappedFunction(eventTarget, wrapped2, [original])).to.equal(wrapped);
      expect(popWrappedFunction(eventTarget, [original])).to.equal(wrapped);
      expect(popWrappedFunction(eventTarget, [original])).to.equal(undefined);
    });

    it('must not fail to pop on object that was never written to', () => {
      expect(popWrappedFunction(eventTarget, [original])).to.equal(undefined);
    });

    it('must only remove when strict equal', () => {
      expect(addWrappedFunction(eventTarget, wrapped, [original, 42])).to.equal(wrapped);
      expect(popWrappedFunction(eventTarget, [original, '42'])).to.equal(undefined);
      expect(popWrappedFunction(eventTarget, [original])).to.equal(undefined);
      expect(popWrappedFunction(eventTarget, [original, 42])).to.equal(wrapped);
    });
  });

  describe('addWrappedDomEventListener / popWrappedDomEventListener', () => {
    it('must support simple one add / one pop', () => {
      expect(addWrappedDomEventListener(eventTarget, wrapped, 'click', original, false)).to.equal(wrapped);
      expect(popWrappedDomEventListener(eventTarget, 'click', original, false)).to.equal(wrapped);
      expect(popWrappedDomEventListener(eventTarget, 'click', original, false)).to.equal(undefined);
    });

    it('must support not allow duplicate registration', () => {
      expect(addWrappedDomEventListener(eventTarget, wrapped, 'click', original, false)).to.equal(wrapped);
      expect(addWrappedDomEventListener(eventTarget, wrapped2, 'click', original, false)).to.equal(wrapped);
      expect(popWrappedDomEventListener(eventTarget, 'click', original, false)).to.equal(wrapped);
      expect(popWrappedDomEventListener(eventTarget, 'click', original, false)).to.equal(undefined);
    });

    it('must identify uniqueness based on event name, function and capture state', () => {
      expect(addWrappedDomEventListener(eventTarget, wrapped, 'click', original, false)).to.equal(wrapped);
      expect(popWrappedDomEventListener(eventTarget, 'mounsein', original, false)).to.equal(undefined);
      expect(popWrappedDomEventListener(eventTarget, 'click', original, true)).to.equal(undefined);
      expect(popWrappedDomEventListener(eventTarget, 'click', original, {capture: true})).to.equal(undefined);
      expect(popWrappedDomEventListener(eventTarget, 'click', original, {capture: false})).to.equal(wrapped);
      expect(popWrappedDomEventListener(eventTarget, 'click', original, false)).to.equal(undefined);
    });
  });
});
