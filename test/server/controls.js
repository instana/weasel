/* eslint-env jasmine */

const request = require('request-promise');
const spawn = require('child_process').spawn;
const path = require('path');
const qs = require('qs');

const util = require('../util');

// See this wiki entry for port selection details
// https://wiki.saucelabs.com/display/DOCS/Sauce+Connect+Proxy+FAQS
const ports = [8000, 8001];
let serverProcess;

exports.registerTestServerHooks = () => {
  beforeEach(() => {
    var env = Object.create(process.env);
    env.BEACON_SERVER_PORTS = ports.join(',');

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
      url: `http://127.0.0.1:${ports[0]}`
    });
  });
}

exports.getServerBaseUrl = () => `http://127.0.0.1:${ports[0]}`;
exports.getE2ETestBaseUrl = (file, query={}) => {
  query.ports = ports.join(',');
  return `http://127.0.0.1:${ports[0]}/e2e/${file}.html?${qs.stringify(query)}`;
};

exports.getBeacons = () => {
  return request({
    method: 'GET',
    url: `http://127.0.0.1:${ports[0]}/transmittedBeacons`
  })
    .then(parseWithDevelopmentInsights);
};

exports.getAjaxRequests = () => {
  return request({
    method: 'GET',
    url: `http://127.0.0.1:${ports[0]}/ajaxRequests`
  })
    .then(parseWithDevelopmentInsights);
};

function parseWithDevelopmentInsights(s) {
  try {
    return JSON.parse(s);
  } catch (e) {
    console.error('Failed to JSON parse', e, 'got: ', s);
    throw e;
  }
}
