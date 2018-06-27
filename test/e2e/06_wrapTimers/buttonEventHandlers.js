(function() {
  $('#forceSetTimeout').on('click', function myClickHandler() {
    setTimeout(throwAnError, 100, 'st');
  });

  $('#forceSetInterval').on('click', function myClickHandler() {
    setInterval(throwAnError, 100, 'si');
  });

  function throwAnError(code) {
    throw new Error('This is intended for testing purposes: ' + code);
  }
})();
