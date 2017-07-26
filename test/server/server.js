const uuidV4 = require('uuid/v4');
const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');

const app = express();

app.use((req, res, next) => {
  res.set('Timing-Allow-Origin', '*');
  next();
});

app.use('/target', express.static(path.join(__dirname, '..', '..', 'target')));
app.use('/e2e', express.static(path.join(__dirname, '..', 'e2e')));

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

const port = process.env.BEACON_SERVER_PORT;
app.listen(port, () => {
});
