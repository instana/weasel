/* eslint-env jest */

import {encode} from '../../lib/transmission/lineEncoding';
import {decode} from './lineEncodingParser';

describe('lineEncodingParser', () => {
  it('must decode beacons', () => {
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
      },
      {
        'key\nwith\nnew\nline': 'a',
        'key\twith\ttabstop': 'b',
        'value with new line': 'a\nb\nc',
        'value with tabstop': 'a\tb\tc',
        'key\\with\nall\treserved\\ncharacters': 'value\\ with\nall\treserved\\ncharacter',
      }
    ];

    expect(decode(encode(beacons))).toMatchSnapshot();
  });
});
