/* eslint-disable */

setTimeout(function() {
  throw new Error('This is an expected runtime error within setTimeout');
}, 0);
