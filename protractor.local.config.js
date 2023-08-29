/* eslint-env node */

const chromeArgs = [
  /*'--disable-web-security'*/
];
const proxy = process.env.HTTP_PROXY || process.env.http_proxy || process.env.HTTPS_PROXY || process.env.https_proxy;
if (proxy) {
  chromeArgs.push(`--proxy-server=${proxy}`);
}

exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['test/e2e/**/*.spec.js'],
  capabilities: {
    'browserName': 'chrome',
    'goog:chromeOptions': {
      'args': chromeArgs
    }
  }
};
