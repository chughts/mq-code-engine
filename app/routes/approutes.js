const express = require('express');
const router = express.Router();

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

module.exports = router;
