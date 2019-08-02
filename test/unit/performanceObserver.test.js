/* eslint-disable quotes */

import sinon from 'sinon';

jest.mock('../../lib/browser');
jest.mock('../../lib/performance');

describe.only('performanceObserver', () => {
  let browserMock;
  let performanceMock;
  let observeResourcePerformance;
  let PerformanceObserverConstructorArgs;
  let PerformanceObserverMock;
  let resourceMatcher;
  let onEnd;
  let clock;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
    resourceMatcher = jest.fn();
    resourceMatcher.mockReturnValue(true);
    browserMock = require('../../lib/browser');
    browserMock.reset();
    PerformanceObserverMock = {
      observe: jest.fn(),
      disconnect: jest.fn()
    };
    PerformanceObserverConstructorArgs = jest.fn();
    browserMock.win.PerformanceObserver = function(opts) {
      PerformanceObserverConstructorArgs(opts);
      return PerformanceObserverMock;
    };

    performanceMock = require('../../lib/performance');
    performanceMock.reset();
    observeResourcePerformance = require('../../lib/performanceObserver').observeResourcePerformance;
    onEnd = jest.fn();
  });

  afterEach(() => {
    clock.restore();
  });

  it('must work when performance observer is not available', () => {
    performanceMock.setPerformanceObserverAvailable(false);
    const observer = observeResourcePerformance({
      entryTypes: ['resource'],
      resourceMatcher: () => true,
      maxWaitForResourceMillis: 1000,
      onEnd
    });

    expectPendingTimers(0);
    observer.onBeforeResourceRetrieval();
    expectPendingTimers(0);
    clock.tick(42);
    observer.onAfterResourceRetrieved();
    expectPendingTimers(0);
    expect(onEnd.mock.calls).toMatchInlineSnapshot(`
                                                                                          Array [
                                                                                            Array [
                                                                                              Object {
                                                                                                "duration": 42,
                                                                                              },
                                                                                            ],
                                                                                          ]
                                                            `);
  });

  it('must handle performance timing before resource completes', () => {
    const observer = observeResourcePerformance({
      entryTypes: ['resource'],
      resourceMatcher,
      maxWaitForResourceMillis: 1000,
      onEnd
    });
    expectPendingTimers(0);

    observer.onBeforeResourceRetrieval();
    expectRegisteredPerformanceObservers(1);
    expectPendingTimers(1);

    const startTime = Date.now();
    clock.tick(42);
    const responseEnd = Date.now();
    simulateResource({
      name: 'customResource',
      startTime,
      responseEnd,
      duration: responseEnd - startTime
    });
    expectRegisteredPerformanceObservers(0);

    observer.onAfterResourceRetrieved();
    expectPendingTimers(0);
    expectRegisteredPerformanceObservers(0);
    expect(getResults()).toMatchInlineSnapshot(`
                                                Array [
                                                  Array [
                                                    Object {
                                                      "duration": 42,
                                                      "resource": Object {
                                                        "duration": 42,
                                                        "name": "customResource",
                                                        "responseEnd": 42,
                                                        "startTime": 0,
                                                      },
                                                    },
                                                  ],
                                                ]
                                `);
  });

  it('must handle performance timing after resource completes', () => {
    const observer = observeResourcePerformance({
      entryTypes: ['resource'],
      resourceMatcher,
      maxWaitForResourceMillis: 1000,
      onEnd
    });
    expectPendingTimers(0);

    observer.onBeforeResourceRetrieval();
    expectRegisteredPerformanceObservers(1);
    expectPendingTimers(1);

    const startTime = Date.now();
    clock.tick(42);

    observer.onAfterResourceRetrieved();
    expectPendingTimers(1);
    expectRegisteredPerformanceObservers(1);
    expect(getResults()).toMatchInlineSnapshot(`Array []`);

    const responseEnd = Date.now();
    simulateResource({
      name: 'customResource',
      startTime,
      responseEnd,
      duration: responseEnd - startTime
    });
    expect(getResults()).toMatchInlineSnapshot(`
                                          Array [
                                            Array [
                                              Object {
                                                "duration": 42,
                                                "resource": Object {
                                                  "duration": 42,
                                                  "name": "customResource",
                                                  "responseEnd": 42,
                                                  "startTime": 0,
                                                },
                                              },
                                            ],
                                          ]
                            `);
    expectPendingTimers(0);
    expectRegisteredPerformanceObservers(0);
  });

  it('must work even when no resource entry is reported', () => {
    const observer = observeResourcePerformance({
      entryTypes: ['resource'],
      resourceMatcher,
      maxWaitForResourceMillis: 1000,
      onEnd
    });
    expectPendingTimers(0);

    observer.onBeforeResourceRetrieval();
    expectRegisteredPerformanceObservers(1);
    expectPendingTimers(1);

    clock.tick(42);
    observer.onAfterResourceRetrieved();
    expectPendingTimers(1);
    expectRegisteredPerformanceObservers(1);
    expect(getResults()).toMatchInlineSnapshot(`Array []`);

    clock.tick(1000);
    expect(getResults()).toMatchInlineSnapshot(`
                                    Array [
                                      Array [
                                        Object {
                                          "duration": 42,
                                          "resource": undefined,
                                        },
                                      ],
                                    ]
                        `);
    expectPendingTimers(0);
    expectRegisteredPerformanceObservers(0);
  });

  it('must dispose all listeners when end is never called', () => {
    const observer = observeResourcePerformance({
      entryTypes: ['resource'],
      resourceMatcher,
      maxWaitForResourceMillis: 1000,
      onEnd
    });
    expectPendingTimers(0);

    observer.onBeforeResourceRetrieval();
    expectRegisteredPerformanceObservers(1);
    expectPendingTimers(1);

    clock.tick(1000 * 60 * 60);
    expectPendingTimers(0);
    expectRegisteredPerformanceObservers(0);
    expect(getResults()).toMatchInlineSnapshot(`Array []`);
  });

  it('must ensure resource time is within start/end time', () => {
    const observer = observeResourcePerformance({
      entryTypes: ['resource'],
      resourceMatcher,
      maxWaitForResourceMillis: 1000,
      onEnd
    });
    expectPendingTimers(0);

    clock.tick(100);
    observer.onBeforeResourceRetrieval();
    expectRegisteredPerformanceObservers(1);
    expectPendingTimers(1);

    simulateResource({
      name: 'customResource',
      startTime: 90,
      responseEnd: 110,
      duration: 20
    });
    expect(getResults()).toMatchInlineSnapshot(`Array []`);
    expectRegisteredPerformanceObservers(1);
    expectPendingTimers(1);

    simulateResource({
      name: 'customResource',
      startTime: 120,
      responseEnd: 180,
      duration: 60
    });
    observer.onAfterResourceRetrieved();
    expect(getResults()).toMatchInlineSnapshot(`
                        Array [
                          Array [
                            Object {
                              "duration": 60,
                              "resource": Object {
                                "duration": 60,
                                "name": "customResource",
                                "responseEnd": 180,
                                "startTime": 120,
                              },
                            },
                          ],
                        ]
                `);
    expectRegisteredPerformanceObservers(0);
    expectPendingTimers(0);
  });

  it('must respect resource matcher', () => {
    const observer = observeResourcePerformance({
      entryTypes: ['resource'],
      resourceMatcher,
      maxWaitForResourceMillis: 1000,
      onEnd
    });
    expectPendingTimers(0);

    clock.tick(100);
    observer.onBeforeResourceRetrieval();
    expectRegisteredPerformanceObservers(1);
    expectPendingTimers(1);

    resourceMatcher.mockReturnValue(false);
    simulateResource({
      name: 'customResource 1',
      startTime: 120,
      responseEnd: 180,
      duration: 60
    });
    expect(getResults()).toMatchInlineSnapshot(`Array []`);
    expectRegisteredPerformanceObservers(1);
    expectPendingTimers(1);

    resourceMatcher.mockReturnValue(true);
    simulateResource({
      name: 'customResource 2',
      startTime: 120,
      responseEnd: 180,
      duration: 60
    });
    observer.onAfterResourceRetrieved();
    expect(getResults()).toMatchInlineSnapshot(`
                        Array [
                          Array [
                            Object {
                              "duration": 60,
                              "resource": Object {
                                "duration": 60,
                                "name": "customResource 2",
                                "responseEnd": 180,
                                "startTime": 120,
                              },
                            },
                          ],
                        ]
                `);
    expectRegisteredPerformanceObservers(0);
    expectPendingTimers(0);
  });

  it('must stop waiting for resource timings when visibility changes to hidden', () => {
    const observer = observeResourcePerformance({
      entryTypes: ['resource'],
      resourceMatcher,
      maxWaitForResourceMillis: 1000,
      onEnd
    });
    observer.onBeforeResourceRetrieval();
    clock.tick(42);
    observer.onAfterResourceRetrieved();
    expectPendingTimers(1);
    expectRegisteredPerformanceObservers(1);
    expect(getResults()).toMatchInlineSnapshot(`Array []`);

    // Simulate going hidden
    Object.defineProperty(browserMock.doc, 'visibilityState', {
      configurable: true,
      get: function() {
        return 'hidden';
      }
    });
    browserMock.doc.dispatchEvent(new Event('visibilitychange'));
    expect(getResults()).toMatchInlineSnapshot(`
      Array [
        Array [
          Object {
            "duration": 42,
            "resource": undefined,
          },
        ],
      ]
    `);
    expectPendingTimers(0);
    expectRegisteredPerformanceObservers(0);
  });

  function simulateResource(resource) {
    expect(PerformanceObserverConstructorArgs.mock.calls.length).toEqual(1);
    PerformanceObserverConstructorArgs.mock.calls[0][0]({
      getEntries() {
        return [resource];
      }
    });
  }

  function getResults() {
    return onEnd.mock.calls;
  }

  function expectRegisteredPerformanceObservers(count) {
    expect(
      PerformanceObserverMock.observe.mock.calls.length - PerformanceObserverMock.disconnect.mock.calls.length
    ).toEqual(count);
  }

  function expectPendingTimers(count) {
    expect(clock.countTimers()).toEqual(count);
  }
});
