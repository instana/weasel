import {encode} from '../../../lib/transmission/lineEncoding';

describe('transmission/lineEncoding', () => {
  it('must encode just one beacon', () => {
    const beacons = [
      {
        page: 'landing',
        key: 'abcdefg',
        id: 42,
        pageVisible: true
      }
    ];

    expect(encode(beacons)).toMatchSnapshot();
  });

  it('must encode multiple beacons', () => {
    const beacons = [
      {
        page: 'landing',
        key: 'abcdefg',
        id: 42,
        pageVisible: true
      },
      {
        page: 'product-details',
        key: 'abcdefg',
        id: 43,
        pageVisible: false,
        m_spec: JSON.stringify({signedIn: true})
      }
    ];

    expect(encode(beacons)).toMatchSnapshot();
  });

  it('must handle reserved characters in keys and values', () => {
    const beacons = [
      {
        'key\nwith\nnew\nline': 'a',
        'key\twith\ttabstop': 'b',
        'value with new line': 'a\nb\nc',
        'value with tabstop': 'a\tb\tc',
        'key\\with\nall\treserved\\ncharacters': 'value\\ with\nall\treserved\\ncharacter',
      }
    ];
    expect(encode(beacons)).toMatchSnapshot();
  });
});
