const express = require('express');
const pug = require('pug');
const path = require('path');

const app = express();

const approutes = require('./routes/approutes');

const MQClient = require('./mqclient');
let mqclient = new MQClient();

let debug_info = require('debug')('mqcodeengine-mqapp:info');
let debug_warn = require('debug')('mqcodeengine-mqapp:warn');

//view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// app.get('/', function (req, res) {
//   res.send('Hello from MQ App v 001');
// })

app.use('/', approutes);

app.get('/mqput', function (req, res) {
  debug_info("Attempting MQ Put");
  mqclient.put("Message app running in Cloud Engine");

  res.send('This is where the put will have happened - not yet functioning');
})


module.exports = app;
