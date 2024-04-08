import { hasOwnProperty } from './util';

const INTERNAL_END_MARKER = '<END>';

type TrieValue = string | number;
type TrieNode = {
  [INTERNAL_END_MARKER]?: Array<TrieValue>;
  [key: string]: TrieNode | Array<TrieValue> | undefined;
};
type TrieResult = {
  '$'?: Array<TrieValue>;
  [key: string]: TrieResult | undefined;
} | Array<TrieValue>;

interface Trie {
  root: TrieNode;
  addItem(key: string, value: TrieValue): Trie;
  insertItem(node: TrieNode, keyCharacters: Array<string>, keyCharacterIndex: number, value: TrieValue): void;
  toJs(node?: TrieNode): TrieResult;
}

export function createTrie() {
  return new Trie();
}

const Trie = function (this: Trie) {
  this.root = {};
} as any as { new(): Trie; };

Trie.prototype.addItem = function addItem(key: string, value: TrieValue) {
  this.insertItem(this.root, key.split(''), 0, value);
  return this;
};

Trie.prototype.insertItem = function insertItem(node: TrieNode, keyCharacters: Array<string>, keyCharacterIndex: number, value: TrieValue) {
  const character = keyCharacters[keyCharacterIndex];
  // Characters exhausted, add value to node
  if (character == null) {
    const values = node[INTERNAL_END_MARKER] = node[INTERNAL_END_MARKER] || [];
    values.push(value);
    return;
  }

  const nextNode = node[character] = node[character] || {};
  this.insertItem(nextNode, keyCharacters, keyCharacterIndex + 1, value);
};

Trie.prototype.toJs = function toJs(node?: TrieNode): TrieResult {
  node = node || this.root as TrieNode;

  const keys = getKeys(node);
  if (keys.length === 1 && keys[0] === INTERNAL_END_MARKER) {
    return (node[INTERNAL_END_MARKER] as Array<TrieValue>).slice();
  }

  const result: TrieResult = {};

  for (let i = 0, length = keys.length; i < length; i++) {
    const key = keys[i];
    if (key === INTERNAL_END_MARKER) {
      result['$'] = (node[INTERNAL_END_MARKER] as Array<TrieValue>).slice();
      continue;
    }

    let combinedKeys = key;
    let child = node[key] as TrieNode;
    let childKeys = getKeys(child);
    while (childKeys.length === 1 && childKeys[0] !== INTERNAL_END_MARKER) {
      combinedKeys += childKeys[0];
      child = child[childKeys[0]] as TrieNode;
      childKeys = getKeys(child);
    }

    result[combinedKeys] = this.toJs(child);
  }

  return result;
};

function getKeys(obj: TrieNode) {
  const result = [];

  for (const key in obj) {
    if (hasOwnProperty(obj, key)) {
      result.push(key);
    }
  }

  return result;
}
