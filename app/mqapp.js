var createError = require('http-errors');
const express = require('express');
const pug = require('pug');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const app = express();
app.use(logger(process.env.REQUEST_LOG_FORMAT || 'dev'));

const approutes = require('./routes/approutes');

// const MQClient = require('./mqclient');
// let mqclient = new MQClient();

let debug_info = require('debug')('mqcodeengine-mqapp:info');
let debug_warn = require('debug')('mqcodeengine-mqapp:warn');

//view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', approutes);

//404s
// app.use(function(req, res, next) {
//   var err = {status : 404}
//   next(err);
// });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  debug_warn('Returning a 404');
  next(createError(404));
});


module.exports = app;
