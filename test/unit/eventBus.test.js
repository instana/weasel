import {expect} from 'chai';
import sinon from 'sinon';

import {on, off, emit, reset} from '../../lib/eventBus';

describe('eventBus', () => {
  let listener;

  beforeEach(() => {
    reset();
    listener = sinon.stub();
  });

  afterEach(reset);

  it('must push events to listeners', () => {
    on('foo', listener);
    emit('foo', 42);
    expect(listener.callCount).to.equal(1);
    expect(listener.getCall(0).args[0]).to.equal(42);
  });

  it('must stop pushing events to listeners', () => {
    on('foo', listener);
    off('foo', listener);
    emit('foo', 42);
    expect(listener.callCount).to.equal(0);
  });

  it('must not fail when there are no listeners to remove', () => {
    off('blub', () => {});
  });

  it('must continue to emit to other listeners once one unsubscribes', () => {
    const listener2 = sinon.stub();
    on('foo', listener);
    on('foo', listener2);
    off('foo', listener2);
    emit('foo', 42);
    expect(listener.callCount).to.equal(1);
    expect(listener2.callCount).to.equal(0);
    expect(listener.getCall(0).args[0]).to.equal(42);
  });

  it('must not fail when there are no listeners to emit for', () => {
    emit('foo', 42);
  });
});
