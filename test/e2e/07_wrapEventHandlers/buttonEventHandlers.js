/* eslint-env browser */

(function() {
  document.getElementById('clickError').addEventListener('click', throwAnError);

  function throwAnError() {
    throw new Error('This is intended for testing purposes');
  }
})();
