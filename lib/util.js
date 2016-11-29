export function noop() {}

// We are trying to stay close to common tracing architectures and use
// a hex encoded 64 bit random ID.
var validIdCharacters = '0123456789abcdef'.split('');
export function generateUniqueId() {
  var result = '';
  for (var i = 0; i < 16; i++) {
    result += validIdCharacters[Math.round(Math.random() * 15)];
  }
  return result;
}
