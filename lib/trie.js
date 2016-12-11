export function createTrie() {
  return new Trie();
}

function Trie() {
  this.root = {};
}

Trie.prototype.addItem = function addItem(key, value) {
  this.insertItem(this.root, key.split(''), 0, value);
  return this;
};

Trie.prototype.insertItem = function insertItem(node, keyCharacters, keyCharacterIndex, value) {
  const character = keyCharacters[keyCharacterIndex];
  // Characters exhausted, add value to node
  if (character == null) {
    const values = node['$'] = node['$'] || [];
    values.push(value);
    return;
  }

  const nextNode = node[character] = node[character] || {};
  this.insertItem(nextNode, keyCharacters, keyCharacterIndex + 1, value);
};

Trie.prototype.toJs = function toJs(node) {
  node = node || this.root;

  const keys = getKeys(node);
  if (keys.length === 1 && keys[0] === '$') {
    return node['$'].slice();
  }

  const result = {};

  for (let i = 0, length = keys.length; i < length ;i++) {
    const key = keys[i];
    const value = node[key];
    if (key === '$') {
      result[key] = value.slice();
      continue;
    }

    let combinedKeys = key;
    let child = node[key];
    let childKeys = getKeys(child);
    while (childKeys.length === 1 && childKeys[0] !== '$') {
      combinedKeys += childKeys[0];
      child = child[childKeys[0]];
      childKeys = getKeys(child);
    }

    result[combinedKeys] = this.toJs(child);
  }

  return result;
};

function getKeys(obj) {
  const result = [];

  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      result.push(key);
    }
  }

  return result;
}
