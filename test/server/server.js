const bodyParser = require('body-parser');
const serveIndex = require('serve-index');
const express = require('express');
const uuidV4 = require('uuid/v4');
const path = require('path');

const app = express();

app.use((req, res, next) => {
  res.set('Timing-Allow-Origin', '*');
  next();
});

app.use((req, res, next) => {
  if (req.query.cors) {
    res.set('Access-Control-Allow-Origin', '*');
  }
  next();
});

app.use((req, res, next) => {
  res.set('Server-Timing', 'intid;desc=aFakeBackendTraceIdForTests');
  next();
});

[
  path.join(__dirname, '..', '..', 'target'),
  path.join(__dirname, '..', 'e2e'),
  path.join(__dirname, '..', 'experiments')
].forEach(p =>
  app.use(`/${path.basename(p)}`, express.static(p), serveIndex(p, {
    icons: true
  }))
);

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => res.send('OK'));

const beaconRequests = [];
app.post('/beacon', (req, res) => {
  beaconRequests.push(req.body);
  res.send('OK');
});

app.get('/beacon', (req, res) => {
  beaconRequests.push(req.query);
  res.send('OK');
});

app.get('/transmittedBeacons', (req, res) => {
  res.json(beaconRequests);
});

app.delete('/transmittedBeacons', (req, res) => {
  beaconRequests.length = 0;
  res.send('OK');
});

const ajaxRequests = [];
app.all('/ajax', (req, res) => {
  const response = uuidV4();
  ajaxRequests.push({
    method: req.method,
    url: req.url,
    params: req.params,
    headers: req.headers,
    response
  });

  // Delay responses to allow timeout tests.
  setTimeout(() => {
    res.send(response);
  }, 100);
});

app.get('/ajaxRequests', (req, res) => {
  res.json(ajaxRequests);
});

process.env.BEACON_SERVER_PORTS
  .split(',')
  .map(v => parseInt(v, 10))
  .forEach(port => app.listen(port, () => {
    if (process.env.IS_TEST !== 'true') {
      console.log('Test server available via http://127.0.0.1:%s (check /e2e, /experiments or /target)', port);
    }
  }));
