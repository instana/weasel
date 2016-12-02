/* eslint-env jasmine */

const request = require('request-promise');
const spawn = require('child_process').spawn;
const path = require('path');

const util = require('../util');

const port = 3008;
let serverProcess;

exports.registerTestHooks = () => {
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


exports.getE2ETestBaseUrl = () => `http://127.0.0.1:${port}/e2e`;


exports.getBeacons = () => {
  return request({
    method: 'GET',
    url: `http://127.0.0.1:${port}/beacon`
  })
  .then(responseBody => JSON.parse(responseBody));
};
