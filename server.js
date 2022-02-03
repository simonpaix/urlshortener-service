require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;

// define object to store original and short urls
let urls = {};
let urlCounter = 0;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.use('/api/shorturl', bodyParser.urlencoded({ extended: false }));

app.post('/api/shorturl', function(req, res) {
  let original_url = req.body.url;
  let dns_url = new URL(original_url)
  let protocol = dns_url.protocol;
  if (protocol != 'http:' && protocol != 'https:') {
    console.log('error invalid protocol ' + protocol)
    res.json({ error: 'invalid url' })
  }
  else {
    let hostname = dns_url.hostname;
    dns.lookup(hostname, (err, addresses) => {
      if (err) {
        res.json({ error: 'invalid url' });
      }
      else {
        urlCounter++;
        //store short original url key value pair
        urls[urlCounter] = original_url;
        res.json({ original_url: original_url, short_url: urlCounter });
      }
    });
  }
});

//redirect to original url according to shorturl
app.get('/api/shorturl/:shorturl', function(req, res) {
  let shorturl = req.params.shorturl;
  res.redirect(urls[shorturl]);

});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
