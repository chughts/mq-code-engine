const express = require('express');
const router = express.Router();

const MQClient = require('../mqclient');
let mqclient = new MQClient();

let debug_info = require('debug')('mqcodeengine-approutes:info');
let debug_warn = require('debug')('mqcodeengine-approutes:warn');

/* GET home page. */
router.get('/', function(req, res, next) {
  debug_info('Routing to /')
  res.render('index', {
    //title: 'Z Client Feedback',
    //msgs: msgs,
    //info: information
  });
});

router.get('/mqput', function(req, res, next) {
  debug_info('Routing to /mqput')
  debug_info("Attempting MQ Put");
  mqclient.put("Message app running in Cloud Engine");

  res.send('Check logs for put');
});

module.exports = router;
