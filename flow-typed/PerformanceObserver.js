// @flow

type PerformanceEntryList = PerformanceEntry[];

declare interface PerformanceObserverEntryList {
  getEntries(): PerformanceEntryList;
  getEntriesByType(type: string): PerformanceEntryList;
  getEntriesByName(name: string, type: ?string): PerformanceEntryList;
}

type PerformanceObserverInit = {
  entryTypes?: string[];
  type?: string;
  buffered?: boolean;
  ...
}

declare class PerformanceObserver {
  constructor(callback: (entries: PerformanceObserverEntryList, observer: PerformanceObserver) => void): void;

  observe(options: ?PerformanceObserverInit): void;
  disconnect(): void;
  takeRecords(): PerformanceEntryList;

  static supportedEntryTypes: string[];
}
