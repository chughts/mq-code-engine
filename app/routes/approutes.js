const express = require('express');
const router = express.Router();

const MQClient = require('../mqclient');
let mqclient = new MQClient();

let debug_info = require('debug')('mqcodeengine-approutes:info');
let debug_warn = require('debug')('mqcodeengine-approutes:warn');

const APPTITLE = 'MQ apps on CodeEngine';

/* GET home page. */
router.get('/', function(req, res, next) {
  debug_info('Routing to /')
  res.render('index', {
    title: APPTITLE
    //msgs: msgs,
    //info: information
  });
});

router.get('/mqput', function(req, res, next) {
  debug_info('Routing to /mqput')
  res.render('mqput', {status: ''});
});

router.post('/api/mqput', function(req, res, next) {
  debug_info('Routing to /api/mqput')

  let data = req.body;
  debug_info('MQ Put Request submitted for ', data);

  let putRequest = {
    message : 'Message app running in Cloud Engine',
    quantity : 1
  }
  if (data.message) {
    putRequest.message = data.message;
  }
  if (data.quantity) {
    putRequest.quantity = data.quantity;
    if (putRequest.quantity < 0) {
      putRequest.quantity *= -1;
    } else if (putRequest.quantity === 0) {
      putRequest.quantity = 1;
    }
  }

  debug_info("Attempting MQ Put for ", putRequest);

  mqclient.put(putRequest)
  .then((statusMsg) => {
    res.json({
      status: statusMsg
    });
  })
  .catch((err) => {
    res.status(500).send({
      error: err
    });
  });

});


module.exports = router;
