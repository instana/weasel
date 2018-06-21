/* eslint-disable no-console */

window.onerror = function onErrorTracker(message, fileName, lineNumber, columnNumber, error) {
  console.log('Got an error:');
  logValue('message', message);
  logValue('fileName', fileName);
  logValue('lineNumber', lineNumber);
  logValue('columnNumber', columnNumber);

  logValue('String(error)', String(error));
  if (error) {
    logValue('error.name', error.name);
    logValue('error.message', error.message);
    logValue('error.stack', error.stack);
  }

  logValue('artificial backtrace', backtrace());

  // return true;
};

console.error = function overwrittenOnError(e) {
  console.log('Retrieved a console error log attempt with arguments', e);
  console.info.apply(console, arguments);
};

function logValue(k, v) {
  console.log('\t\t%s (type %s):', k, typeof v, v);
}

function backtrace() {
  var curr = arguments.callee.caller;
  var output = '';
  while (curr != null) {
    output += curr.name + '\n';
    curr = curr.caller;
  }
  return output;
}
