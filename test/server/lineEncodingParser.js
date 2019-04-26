exports.decode = str => {
  const beacons = [];
  const lines = str.split('\n');

  let beacon = {};
  beacons.push(beacon);
  lines.forEach(line => {
    if (line.length === 0) {
      beacon = {};
      beacons.push(beacon);
    } else {
      const [key, value] = line.split('\t', 2);
      beacon[decodePart(key)] = decodePart(value);
    }
  });

  return beacons;
};

function decodePart(part) {
  let result = '';

  for (let i = 0; i < part.length; i++) {
    const char = part.charAt(i);
    if (char === '\\') {
      const nextChar = part.charAt(i + 1);
      if (nextChar === 't') {
        result += '\t';
      } else if (nextChar === 'n') {
        result += '\n';
      } else if (nextChar === '\\') {
        result += '\\';
      } else {
        result += '\\' + nextChar;
      }
      i++;
    } else {
      result += char;
    }
  }

  return result;
}
