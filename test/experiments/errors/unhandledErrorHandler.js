/* eslint-disable no-console */

(function() {
  window.onerror = function onErrorTracker(message, fileName, lineNumber, columnNumber, error) {
    console.log('Got an error:');
    logValue('message', message);
    logValue('fileName', fileName);
    logValue('lineNumber', lineNumber);
    logValue('columnNumber', columnNumber);

    logValue('String(error)', String(error));
    logValue('typeof error', typeof error);
    if (error) {
      logValue('error.name', error.name);
      logValue('error.message', error.message);
      logValue('error.stack', error.stack);
    }

    logValue('artificial backtrace', backtrace());
  };

  function logValue(k, v) {
    console.log('\t\t%s (type %s):', k, typeof v, v);
  }

  // Overwrite to see whether browsers actually go through console.error to display
  // uncaught errors within the console. They don't: They just render them within
  // the console view, but they don't go through the console APIs.
  console.error = function overwrittenOnError(e) {
    console.log('Retrieved a console error log attempt with arguments', e);
    console.info.apply(console, arguments);
  };

  window.tryCatchAndReport = function tryCatchAndReport(fn) {
    try {
      fn();
    } catch (e) {
      window.onerror(0, 0, 0, 0, e);
    }
  };

  var originalSetTimeout = window.setTimeout;
  window.setTimeout = function(fn) {
    var args = Array.prototype.slice.apply(arguments);
    args[0] = function customSetTimeoutInitiator() {
      try {
        fn();
      } catch (e) {
        window.onerror(0, 0, 0, 0, e);
      }
    };
    return originalSetTimeout.apply(window, args);
  };


  function backtrace() {
    var curr = arguments.callee.caller;
    var output = '';
    while (curr != null) {
      output += curr.name + '\n';
      curr = curr.caller;
    }
    return output;
  }
})();
