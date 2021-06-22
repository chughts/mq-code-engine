const express = require('express');
const router = express.Router();

const MQClient = require('../mqclient');
let mqclient = new MQClient();

let debug_info = require('debug')('mqcodeengine-approutes:info');
let debug_warn = require('debug')('mqcodeengine-approutes:warn');

const APPTITLE = 'MQ apps on CodeEngine';
const DEFAULT_LIMIT = 10;

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
  debug_info('Routing to /mqput');
  res.render('mqput', {status: ''});
});

router.post('/api/mqput', function(req, res, next) {
  debug_info('Routing to /api/mqput');

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


router.get('/api/mqget', function(req, res, next) {
  debug_info('Routing to /api/mqget');

  let querydata = req.query;
  debug_info('MQ Get Request submitted for ', querydata);

  let getLimit = DEFAULT_LIMIT;
  if (querydata && querydata.limit && !isNaN(querydata.limit)) {
    getLimit = querydata.limit;
  }

  mqclient.get(getLimit)
  .then((data) => {
    res.json(data);
  })
  .catch((err) => {
    res.status(500).send({
      error: err
    });
  });
});

router.get('/api/mqgetbyid', function(req, res, next) {
  debug_info('Routing to /api/mqgetbyid');

  let querydata = req.query;
  debug_info('MQ Get by id request submitted for ', querydata);

  let msgid = null;
  if (querydata && querydata.msgid) {
    msgid = querydata.msgid;
    res.json({
      status: 'Request was received'
    });
    // No need to tell requester about subsequent processing
    mqclient.getById(msgid)
    .then((data) => {
      debug_info('Message data obtained ready to process ...');
    })
    .catch((err) => {
      debug_info('Unable to obtain message');
    })
  } else {
    res.status(500).send({
      error: 'request was missing msgid'
    });
  }


});


module.exports = router;
