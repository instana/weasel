export function noop() {}

// We are trying to stay close to common tracing architectures and use
// a hex encoded 64 bit random ID.
var validIdCharacters = '0123456789abcdef'.split('');
var numberOfValidIdCharacters = validIdCharacters.length;
export function generateUniqueId() {
  var result = '';
  for (var i = 0; i < 16; i++) {
    result += getRandomIdCharacter();
  }
  return result;
}

function getRandomIdCharacter() {
  return validIdCharacters[Math.round(Math.random() * validIdCharacters.length - 1)]
}
