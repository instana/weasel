/* eslint-env jasmine */

const request = require('request-promise');
const spawn = require('child_process').spawn;
const path = require('path');

const util = require('../util');

// See this wiki entry for port selection details
// https://wiki.saucelabs.com/display/DOCS/Sauce+Connect+Proxy+FAQS
const port = 8000;
let serverProcess;

exports.registerTestServerHooks = () => {
  beforeEach(() => {
    var env = Object.create(process.env);
    env.BEACON_SERVER_PORT = port;

    serverProcess = spawn('node', [path.join(__dirname, 'server.js')], {
      stdio: [process.stdin, process.stdout, process.stderr],
      env: env
    });

    return waitUntilServerIsUp();
  });

  afterEach(() => {
    serverProcess.kill();
  });
};


function waitUntilServerIsUp() {
  return util.retry(() => {
    return request({
      method: 'GET',
      url: `http://127.0.0.1:${port}`
    });
  });
}

exports.getServerBaseUrl = () => `http://127.0.0.1:${port}`;
exports.getE2ETestBaseUrl = file => `http://127.0.0.1:${port}/e2e/${file}.html`;


exports.getBeacons = () => {
  return request({
    method: 'GET',
    url: `http://127.0.0.1:${port}/transmittedBeacons`
  })
  .then(responseBody => JSON.parse(responseBody));
};


exports.getAjaxRequests = () => {
  return request({
    method: 'GET',
    url: `http://127.0.0.1:${port}/ajaxRequests`
  })
  .then(responseBody => JSON.parse(responseBody));
};
