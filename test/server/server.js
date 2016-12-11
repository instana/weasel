const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');

const app = express();

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
  res.json(beaconRequests);
});

app.delete('/beacon', (req, res) => {
  beaconRequests.length = 0;
  res.send('OK');
});

const port = process.env.BEACON_SERVER_PORT;
app.listen(port, () => {
});
