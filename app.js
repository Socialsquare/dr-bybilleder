const assert = require('assert');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const express = require('express');
const favicon = require('serve-favicon');
const fs = require('fs');
const logger = require('morgan');
const path = require('path');
const cors = require('cors');

dotenv.config();

const collages = require('./routes/collages');
const recent = require('./routes/recent');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({
  limit: '10mb'
}));
app.use(cors({ origin: 'http://www.danskkulturarv.dk' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Load the index middleware
// app.use(require('./index.js').middleware);

// Serve static files from the clients build folder
const CLIENT_BUILD_PATH = path.join(__dirname, 'client', 'build');
assert.ok(fs.existsSync(CLIENT_BUILD_PATH), 'Build the client first');
app.use(express.static(CLIENT_BUILD_PATH));

app.use('/recent', recent);
app.use('/', collages);

const CLIENT_INDEX_PATH = path.join(CLIENT_BUILD_PATH, 'index.html');
//Instead of 404, render the clients index.html
app.use(function(req, res, next) {
  if(req.accepts(['html', 'json']) === 'html') {
    res.sendFile(CLIENT_INDEX_PATH);
  } else {
    next();
  }
});

// error handler
app.use(function(err, req, res, next) {
  // render the error page
  res.status(err.status || 500);
  console.error(err);
  res.json({
    message: err.message
  });
});

module.exports = app;
