const Promise = require('bluebird');

exports.retry = function retry(fn, time, until) {
  if (time == null) {
    time = exports.getTestTimeout() / 2;
  }

  if (until == null) {
    until = Date.now() + time;
  }

  if (Date.now() > until) {
    return fn();
  }

  return Promise.delay(time / 20)
    .then(fn)
    .catch(function() {
      return retry(fn, time, until);
    });
};


exports.getTestTimeout = function() {
  if (process.env.CI) {
    return 30000;
  }
  return 5000;
};
