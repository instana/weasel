jest.mock('../../lib/browser');
jest.mock('../../lib/vars');
jest.mock('../../lib/util');

describe('transmission/batched', () => {
  let utilMock;
  let browserMock;
  let varsMock;
  let trackSessions;
  let terminateSession;

  beforeEach(() => {
    utilMock = require('../../lib/util');
    utilMock.reset();
    browserMock = require('../../lib/browser');
    browserMock.reset();
    varsMock = require('../../lib/vars').default;
    const mod = require('../../lib/session');
    trackSessions = mod.trackSessions;
    terminateSession = mod.terminateSession;
    global.DEBUG = false;
  });

  afterEach(() => {
    browserMock.reset();
    varsMock.sessionId = undefined;
    delete global.DEBUG;
  });

  it('must not store a session ID by default', () => {
    expect(varsMock.sessionId).toEqual(undefined);
    expect(browserMock.localStorage.getItem('session')).toEqual(undefined);
  });

  it('must create and serialize a new session when asked to', () => {
    trackSessions();
    expect(varsMock.sessionId).toEqual('a');
    expect(browserMock.localStorage.getItem('session')).toEqual('a#100#100');
  });

  it('must move last activity time forward on subsequent calls', () => {
    trackSessions();
    expect(varsMock.sessionId).toEqual('a');

    utilMock.setNow(150);
    trackSessions();
    expect(varsMock.sessionId).toEqual('a');
    expect(browserMock.localStorage.getItem('session')).toEqual('a#100#150');
  });

  it('must start new session when activity timeout expires', () => {
    trackSessions(10, 100);
    expect(varsMock.sessionId).toEqual('a');

    utilMock.setNow(150);
    trackSessions(10, 100);
    expect(browserMock.localStorage.getItem('session')).toEqual('b#150#150');
    expect(varsMock.sessionId).toEqual('b');
  });

  it('must start new session when termination timeout expires', () => {
    trackSessions(100, 10);
    expect(varsMock.sessionId).toEqual('a');

    utilMock.setNow(150);
    trackSessions(100, 10);
    expect(browserMock.localStorage.getItem('session')).toEqual('b#150#150');
    expect(varsMock.sessionId).toEqual('b');
  });

  it('must start new session when persisted value is corrupted', () => {
    browserMock.localStorage.setItem('session', 'borked');
    trackSessions();
    expect(varsMock.sessionId).toEqual('a');
    expect(browserMock.localStorage.getItem('session')).toEqual('a#100#100');

    browserMock.localStorage.setItem('session', '#34#34');
    trackSessions();
    expect(varsMock.sessionId).toEqual('b');
    expect(browserMock.localStorage.getItem('session')).toEqual('b#100#100');

    browserMock.localStorage.setItem('session', 'foo#b#42');
    trackSessions();
    expect(varsMock.sessionId).toEqual('c');
    expect(browserMock.localStorage.getItem('session')).toEqual('c#100#100');

    browserMock.localStorage.setItem('session', 'foo#42#c');
    trackSessions();
    expect(varsMock.sessionId).toEqual('d');
    expect(browserMock.localStorage.getItem('session')).toEqual('d#100#100');
  });

  it('must not fail when localStorage.getItem throws an error', () => {
    browserMock.localStorage.getItem = () => {
      throw new Error('test');
    };
    trackSessions();
    expect(varsMock.sessionId).toEqual(undefined);
  });

  it('must not fail when localStorage.setItem throws an error', () => {
    browserMock.localStorage.setItem = () => {
      throw new Error('test');
    };
    trackSessions();
    expect(varsMock.sessionId).toEqual(undefined);
  });

  it('must terminate sessions', () => {
    trackSessions();
    terminateSession();
    expect(varsMock.sessionId).toEqual(undefined);
    expect(browserMock.localStorage.getItem('session')).toEqual(undefined);
  });
});
