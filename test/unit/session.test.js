jest.mock('../../lib/browser');
jest.mock('../../lib/vars');
jest.mock('../../lib/util');

describe('transmission/batched', () => {
  let utilMock;
  let browserMock;
  let varsMock;
  let recordSessionInformation;

  beforeEach(() => {
    utilMock = require('../../lib/util');
    utilMock.reset();
    browserMock = require('../../lib/browser');
    browserMock.reset();
    varsMock = require('../../lib/vars').default;
    recordSessionInformation = require('../../lib/session').recordSessionInformation;
    global.DEBUG = false;
  });

  afterEach(() => {
    browserMock.reset();
    varsMock.sessionId = undefined;
    delete global.DEBUG;
  });

  it('must not store a session ID by default', () => {
    expect(varsMock.sessionId).toEqual(undefined);
  });

  it('must create and serialize a new session when asked to', () => {
    recordSessionInformation();
    expect(varsMock.sessionId).toEqual('a');
    expect(browserMock.localStorage.getItem('session')).toEqual('a#100#100');
  });

  it('must move last activity time forward on subsequent calls', () => {
    recordSessionInformation();
    expect(varsMock.sessionId).toEqual('a');

    utilMock.setNow(150);
    recordSessionInformation();
    expect(varsMock.sessionId).toEqual('a');
    expect(browserMock.localStorage.getItem('session')).toEqual('a#100#150');
  });

  it('must start new session when activity timeout expires', () => {
    recordSessionInformation(10, 100);
    expect(varsMock.sessionId).toEqual('a');

    utilMock.setNow(150);
    recordSessionInformation(10, 100);
    expect(browserMock.localStorage.getItem('session')).toEqual('b#150#150');
    expect(varsMock.sessionId).toEqual('b');
  });

  it('must start new session when termination timeout expires', () => {
    recordSessionInformation(100, 10);
    expect(varsMock.sessionId).toEqual('a');

    utilMock.setNow(150);
    recordSessionInformation(100, 10);
    expect(browserMock.localStorage.getItem('session')).toEqual('b#150#150');
    expect(varsMock.sessionId).toEqual('b');
  });

  it('must start new session when persisted value is corrupted', () => {
    browserMock.localStorage.setItem('session', 'borked');
    recordSessionInformation();
    expect(varsMock.sessionId).toEqual('a');
    expect(browserMock.localStorage.getItem('session')).toEqual('a#100#100');

    browserMock.localStorage.setItem('session', '#34#34');
    recordSessionInformation();
    expect(varsMock.sessionId).toEqual('b');
    expect(browserMock.localStorage.getItem('session')).toEqual('b#100#100');

    browserMock.localStorage.setItem('session', 'foo#b#42');
    recordSessionInformation();
    expect(varsMock.sessionId).toEqual('c');
    expect(browserMock.localStorage.getItem('session')).toEqual('c#100#100');

    browserMock.localStorage.setItem('session', 'foo#42#c');
    recordSessionInformation();
    expect(varsMock.sessionId).toEqual('d');
    expect(browserMock.localStorage.getItem('session')).toEqual('d#100#100');
  });

  it('must not fail when localStorage.getItem throws an error', () => {
    browserMock.localStorage.getItem = () => {
      throw new Error('test');
    };
    recordSessionInformation();
    expect(varsMock.sessionId).toEqual(undefined);
  });

  it('must not fail when localStorage.setItem throws an error', () => {
    browserMock.localStorage.setItem = () => {
      throw new Error('test');
    };
    recordSessionInformation();
    expect(varsMock.sessionId).toEqual(undefined);
  });
});
