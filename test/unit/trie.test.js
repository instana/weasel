import {expect} from 'chai';

import {createTrie} from '../../lib/trie';

describe('trie', () => {
  let t;

  beforeEach(() => {
    global.DEBUG = true;
    t = null;
  });

  it('must deserialize to an empty map when the trie is empty', () => {
    t = createTrie().toJs();
    expect(t).to.deep.equal({});
  });

  it('must deserialize to a single node when there is only one item', () => {
    t = createTrie()
      .addItem('Guide', 42)
      .toJs();
    expect(t).to.deep.equal({'Guide': [42]});
  });

  it('must support multiple items which do not need ot be merged', () => {
    t = createTrie()
      .addItem('Guide', 42)
      .addItem('Food', 21)
      .toJs();
    expect(t).to.deep.equal({
      'Guide': [42],
      'Food': [21]
    });
  });

  it('must merge duplicate keys', () => {
    t = createTrie()
      .addItem('Guide', 42)
      .addItem('Guide', 43)
      .toJs();
    expect(t).to.deep.equal({
      Guide: [42, 43]
    });
  });

  it('must optimize tree keys', () => {
    t = createTrie()
      .addItem('Guide', 42)
      .addItem('Goal', 21)
      .toJs();
    expect(t).to.deep.equal({
      G: {
        'uide': [42],
        'oal': [21]
      }
    });
  });

  it('must optimize more complicated trees', () => {
    t = createTrie()
      .addItem('Abcdef', 42)
      .addItem('Abc', 23)
      .addItem('Abcdef', 21)
      .addItem('F', 22)
      .toJs();
    expect(t).to.deep.equal({
      F: [22],
      Abc: {
        $: [23],
        def: [42, 21]
      }
    });
  });
});
