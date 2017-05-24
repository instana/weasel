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

  it('must handle URL paths', () => {
    t = createTrie()
      .addItem('https://assets-cdn.github.com/assets/frameworks-7f2a605da6435efc2ee84e59714b38adf17b327656cf5739a7f65a0029fbe2d5.css', 42)
      .addItem('https://assets-cdn.github.com/assets/github-66b4793238c819b34fb96e3275e183137b80b9c46385fb8aea5551146f74fef2.css', 23)
      .addItem('https://avatars0.githubusercontent.com/u/596443?v=3&s=40', 21)
      .addItem('https://assets-cdn.github.com/images/spinners/octocat-spinner-128.gif', 22)
      .toJs();
    expect(t).to.deep.equal({
      'https://a': {
        'ssets-cdn.github.com/': {
          'assets/': {
            'frameworks-7f2a605da6435efc2ee84e59714b38adf17b327656cf5739a7f65a0029fbe2d5.css': [
              42
            ],
            'github-66b4793238c819b34fb96e3275e183137b80b9c46385fb8aea5551146f74fef2.css': [
              23
            ]
          },
          'images/spinners/octocat-spinner-128.gif': [
            22
          ]
        },
        'vatars0.githubusercontent.com/u/596443?v=3&s=40': [
          21
        ]
      }
    });
  });

  it('must handle localhost path regression', () => {
    t = createTrie()
      .addItem('http://localhost:3009/e2e/initializer.js', '-446,8,3,3,501')
      .addItem('http://localhost:3009/target/weasel.debug.min.js', '-57,4,3,3,3641')
      .toJs();
    expect(t).to.deep.equal({
      'http://localhost:3009/': {
        'e2e/initializer.js': [
          '-446,8,3,3,501'
        ],
        'target/weasel.debug.min.js': [
          '-57,4,3,3,3641'
        ]
      }
    });
  });

  it('must handle $ characters in items', () => {
    t = createTrie()
      .addItem('http://localhost:3009/$abc', 'abc')
      .addItem('http://localhost:3009/$def', 'def')
      .toJs();
    expect(t).to.deep.equal({
      'http://localhost:3009/$': {
        'abc': ['abc'],
        'def': ['def']
      }
    });
  });

  it('must handle internal end marker in items', () => {
    t = createTrie()
      .addItem('http://localhost:3009/ENDabc', 'abc')
      .addItem('http://localhost:3009/ENDdef', 'def')
      .addItem('http://localhost:3008/abc', 'abc')
      .addItem('http://localhost:3008/ENDdef', 'ENDdef')
      .toJs();
    expect(t).to.deep.equal({
      'http://localhost:300': {
        '9/END': {
          'abc': ['abc'],
          'def': ['def']
        },
        '8/': {
          'abc': ['abc'],
          'ENDdef': ['ENDdef']
        }
      }
    });
  });
});
