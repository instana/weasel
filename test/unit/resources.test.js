import { initiatorTypes, cachingTypes } from '../../lib/resources/consts';
import { serializeEntry } from '../../lib/resources/timingSerializer';
import vars from '../../lib/vars';

const columnMappings = [
  'time',
  'duration',
  'initiator',
  'cachingType',
  'encodedBodySize',
  'decodedBodySize',
  'transferSize',
  'redirect',
  'appcache',
  'dns',
  'tcp',
  'ssl',
  'request',
  'response',
  'backendTraceId',
  'ttfb'
];

const columnValueResolvers = {
  2: initiatorTypes,
  3: cachingTypes
};

describe('resources/timingSerializer', () => {
  beforeEach(() => {
    vars.highResTimestampReference = 0;
  });

  describe('serializeEntry', () => {
    it('must identify retrieval from cache', () => {
      const entry = {
        name: 'https://www.example.com/images/image.png',
        entryType: 'resource',
        startTime: 434.9000000001979,
        duration: 4.399999997986015,
        initiatorType: 'img',
        nextHopProtocol: 'http/2+quic/43',
        workerStart: 0,
        redirectStart: 0,
        redirectEnd: 0,
        fetchStart: 434.9000000001979,
        domainLookupStart: 434.9000000001979,
        domainLookupEnd: 434.9000000001979,
        connectStart: 434.9000000001979,
        connectEnd: 434.9000000001979,
        secureConnectionStart: 0,
        requestStart: 437.39999999888823,
        responseStart: 437.7999999996973,
        responseEnd: 439.2999999981839,
        transferSize: 0,
        encodedBodySize: 16786,
        decodedBodySize: 16786,
        serverTiming: []
      };
      const result = toHumanReadableEntry(serializeEntry(entry));
      expect(result).toMatchSnapshot();
      expect(result['backendTraceId']).toBe("");
    });

    it('must identify full asset retrieval', () => {
      const entry = {
        name: 'https://www.example.com/images/image.png',
        entryType: 'resource',
        startTime: 1136.8000000002212,
        duration: 231.5999999991618,
        initiatorType: 'img',
        nextHopProtocol: 'http/2+quic/43',
        workerStart: 0,
        redirectStart: 0,
        redirectEnd: 0,
        fetchStart: 1136.8000000002212,
        domainLookupStart: 1136.8000000002212,
        domainLookupEnd: 1136.8000000002212,
        connectStart: 1136.8000000002212,
        connectEnd: 1136.8000000002212,
        secureConnectionStart: 0,
        requestStart: 1141.7999999976018,
        responseStart: 1329.0999999990163,
        responseEnd: 1368.399999999383,
        transferSize: 16835,
        encodedBodySize: 16786,
        decodedBodySize: 16786,
        serverTiming: [
          {
            name: 'intid',
            description: '3748eabc1876cdaa'
          }
        ]
      };
      const result = toHumanReadableEntry(serializeEntry(entry));
      expect(result).toMatchSnapshot();
      expect(result['backendTraceId']).not.toBeNull();
    });

    it('must identify cache validation', () => {
      const entry = {
        name: 'https://www.example.com/images/image.png',
        entryType: 'resource',
        startTime: 1136.8000000002212,
        duration: 231.5999999991618,
        initiatorType: 'img',
        nextHopProtocol: 'http/2+quic/43',
        workerStart: 0,
        redirectStart: 0,
        redirectEnd: 0,
        fetchStart: 1136.8000000002212,
        domainLookupStart: 1136.8000000002212,
        domainLookupEnd: 1136.8000000002212,
        connectStart: 1136.8000000002212,
        connectEnd: 1136.8000000002212,
        secureConnectionStart: 0,
        requestStart: 1141.7999999976018,
        responseStart: 1329.0999999990163,
        responseEnd: 1368.399999999383,
        transferSize: 4320,
        encodedBodySize: 16786,
        decodedBodySize: 16786,
        serverTiming: []
      };
      const result = toHumanReadableEntry(serializeEntry(entry));
      expect(result).toMatchSnapshot();
      expect(result['backendTraceId']).toBe("");
    });
  });
});

function toHumanReadableEntry(str) {
  return str.split(',').reduce((agg, val, i) => {
    if (columnValueResolvers[i] && val !== '') {
      agg[columnMappings[i]] = getKeyForValue(columnValueResolvers[i], val) || 'UNKNOWN_EUM_VALUE';
    } else {
      agg[columnMappings[i]] = val;
    }
    return agg;
  }, {});
}

function getKeyForValue(obj, value) {
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (String(obj[key]) === String(value)) {
      return key;
    }
  }
  return null;
}
