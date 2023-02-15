const bodyParser = require('body-parser');
const multiparty = require('multiparty');
const serveIndex = require('serve-index');
const express = require('express');
const uuidV4 = require('uuid/v4');
const path = require('path');

const {decode} = require('./lineEncodingParser');
const graphql = require('./graphql');

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
  if (req.query.csp) {
    const hosts = process.env.BEACON_SERVER_PORTS
      .split(',')
      .map(p => `http://127.0.0.1:${p}`)
      .join(' ');
    res.set('Content-Security-Policy', `default-src ${hosts}; script-src 'unsafe-inline' ${hosts};`);
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
  app.use(
    `/${path.basename(p)}`,
    express.static(p),
    serveIndex(p, {
      icons: true
    })
  )
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.raw({ type: 'text/plain' }));

app.get('/', (req, res) => res.send('OK'));

const beaconRequests = [];
app.post('/beacon', (req, res) => {
  if (req.is('text/plain')) {
    const str = req.body.toString('utf8');
    beaconRequests.push.apply(beaconRequests, decode(str));
  } else {
    beaconRequests.push(req.body);
  }
  res.send('OK');
});

app.get('/beacon', (req, res) => {
  beaconRequests.push(req.query);
  res.send('OK');
});

app.post('/beacon_2', (req, res) => {
  if (req.is('text/plain')) {
    const str = req.body.toString('utf8');
    beaconRequests.push.apply(beaconRequests, decode(str));
  } else {
    beaconRequests.push(req.body);
  }
  res.send('OK');
});

app.get('/beacon_2', (req, res) => {
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

app.post('/form', (req, res) => {

  const form = new multiparty.Form();
  let response = uuidV4();
  form.parse(req, function(err, fields) {
    if (err) {
      response = 'ERROR';
    }

    if (!fields) {
      response = 'ERROR';
    } else {
      ajaxRequests.push({
        method: req.method,
        url: req.url,
        params: req.params,
        headers: req.headers,
        response,
        fields
      });
    }
  });

  // Delay responses to allow timeout tests.
  setTimeout(() => {
    res.send(response);
  }, 100);
});

app.get('/ajaxRequests', (req, res) => {
  res.json(ajaxRequests);
});

graphql.applyMiddleware({app});

process.env.BEACON_SERVER_PORTS.split(',')
  .map(v => parseInt(v, 10))
  .forEach(port =>
    app.listen(port, () => {
      if (process.env.IS_TEST !== 'true') {
        log('Test server available via http://127.0.0.1:%s (check /e2e, /experiments or /target)', port);
      }
    })
  );

if (process.env.IS_TEST !== 'true') {
  log(
    '\nOpen http://127.0.0.1:%s/e2e?ports=%s to check cross-origin cases',
    process.env.BEACON_SERVER_PORTS.split(',')[0],
    process.env.BEACON_SERVER_PORTS
  );

  log(
    'Please ensure that you retain the ?ports query parameters when opening\n' +
      'cross-origin test cases manually. As this is a required parameter for them.\n\n'
  );
}

function log(...args) {
  if (process.env['npm_lifecycle_script'] == null || !process.env['npm_lifecycle_script'].startsWith('jest')) {
    console.log.apply(console, args);
  }
}
