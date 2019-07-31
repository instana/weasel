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
      entryTypes: 'resource',
      resourceMatcher:  () => true,
      maxWaitForResourceMillis: 1000,
      onEnd
    });

    observer.onBeforeResourceRetrieval();
    clock.tick(42);
    observer.onAfterResourceRetrieved();

    expect(onEnd).toMatchSnapshot();
    expect(PerformanceObserverConstructorArgs).toMatchSnapshot();
  });

  it('must handle performance timing before resource completes', () => {
    const observer = observeResourcePerformance({
      entryTypes: 'resource',
      resourceMatcher,
      maxWaitForResourceMillis: 1000,
      onEnd
    });

    observer.onBeforeResourceRetrieval();
    simulateResource({
      name: 'customResource',
      startTime: Date.now(),
      responseEnd: Date.now()
    });
    observer.onAfterResourceRetrieved();

    expect(onEnd).toMatchSnapshot();
    expect(browserMock.win.PerformanceObserver).toMatchSnapshot();
  });

  function simulateResource(resource) {
    expect(PerformanceObserverConstructorArgs.mock.calls.length).toEqual(1);
    PerformanceObserverConstructorArgs.mock.calls[0][0]({
      getEntries() {
        return [resource];
      }
    });
  }
});
