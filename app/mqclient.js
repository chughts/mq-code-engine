// Import the MQ package
const mq = require('ibmmq');

// Load up missing envrionment variables from the env.json file
const env = require('./env.json');

var MQC = mq.MQC;

// Set up debug logging options
let debug_info = require('debug')('mqcodeengine-mqclient:info');
let debug_warn = require('debug')('mqcodeengine-mqclient:warn');


// Load the MQ Endpoint details either from the envrionment or from the
// env.json file. The envrionment takes precedence.
// The json file allows for
// mulitple endpoints ala a cluster. The connection string is built
// using the host(port) values for all the endpoints.
// For all the other fields only the first
// endpoint in the arryay is used.
var MQDetails = {};

['QMGR', 'QUEUE_NAME', 'HOST', 'PORT', 'MQ_PORT',
 'CHANNEL', 'KEY_REPOSITORY', 'CIPHER'].forEach(function(f) {
  MQDetails[f] = process.env[f] || env.MQ_ENDPOINTS[0][f]
});

if (MQDetails['MQ_PORT']) {
  MQDetails['PORT'] = MQDetails['MQ_PORT'];
}

var credentials = {
  USER: process.env.APP_USER || env.MQ_ENDPOINTS[0].APP_USER,
  PASSWORD: process.env.APP_PASSWORD || env.MQ_ENDPOINTS[0].APP_PASSWORD
};


class MQClient {

  constructor() {
    this._hconn = null;
    this._hObj = null;
  }

  check() {
    debug_info("MQ Client Check function invoked");
  }

  buildCNO() {
    return new Promise((resolve, reject) => {
      debug_info("Building CNO Object");
      let cno = new mq.MQCNO();
      cno.Options = MQC.MQCNO_CLIENT_BINDING;

      let csp = new mq.MQCSP();
      csp.UserId = credentials.USER;
      csp.Password = credentials.PASSWORD;
      cno.SecurityParms = csp;

      // And then fill in relevant fields for the MQCD
      var cd = new mq.MQCD();

      cd.ChannelName = MQDetails.CHANNEL;
      cd.ConnectionName = this.getConnection();
      debug_info('Connections string is ', cd.ConnectionName);

      if (MQDetails.KEY_REPOSITORY) {
        debug_info('Will be running in TLS Mode');

        cd.SSLCipherSpec = MQDetails.CIPHER;
        cd.SSLClientAuth = MQC.MQSCA_OPTIONAL;
      }

      // Make the MQCNO refer to the MQCD
      cno.ClientConn = cd;

      // The location of the KeyRepository is not specified in the CCDT, so regardless
      // of whether a CCDT is being used, need to specify the KeyRepository location
      // if it has been provided in the environment json settings.
      if (MQDetails.KEY_REPOSITORY) {
        debug_info('Key Repository has been specified');
        // *** For TLS ***
        var sco = new mq.MQSCO();

        sco.KeyRepository = MQDetails.KEY_REPOSITORY;
        // And make the CNO refer to the SSL Connection Options
        cno.SSLConfig = sco;
      }

      resolve(cno);
    });
  }

  performConnection() {
    return new Promise((resolve, reject) => {
      this.buildCNO()
      .then((cno) => {
        debug_info("CNO Built");
        return mq.ConnxPromise(MQDetails.QMGR, cno);
      })
      .then((hconn) => {
        debug_info("Connected to MQ");
        this._hconn = hconn;
        return this.performOpen();
      })
      .then((hObj) => {
        debug_info("MQ Queue is open");
        this._hObj = hObj;
        resolve();
      })
      .catch((err) => {
        debug_warn("Error establising connection to MQ");
        debug_warn(err);
        reject(err);
      });
    });
    debug_info("Establishing Connection to MQ");
  }

  performOpen() {
    let od = new mq.MQOD();
    od.ObjectName = MQDetails.QUEUE_NAME;
    od.ObjectType = MQC.MQOT_Q;
    let openOptions = MQC.MQOO_OUTPUT;

    return mq.OpenPromise(this._hconn, od, openOptions);
  }

  getConnection() {
    let points = [];

    if (process.env['HOST'] && process.env['MQ_PORT']) {
      let h = process.env['HOST'];
      let p = process.env['MQ_PORT'];
      points.push(`${h}(${p})`)
    } else {
      env.MQ_ENDPOINTS.forEach((p) => {
        if (p['HOST'] && p['PORT']) {
          points.push(`${p.HOST}(${p.PORT})`)
        }
      });
    }

    return points.join(',');
  }

  performPut(message) {
    let msgObject = {
      'Message' : message,
      'Sent': '' + new Date()
    }
    let msg = JSON.stringify(msgObject);

    var mqmd = new mq.MQMD(); // Defaults are fine.
    var pmo = new mq.MQPMO();

    // Describe how the Put should behave
    pmo.Options = MQC.MQPMO_NO_SYNCPOINT |
      MQC.MQPMO_NEW_MSG_ID |
      MQC.MQPMO_NEW_CORREL_ID;

    return mq.PutPromise(this._hObj, mqmd, pmo, msg);
  }

  performCleanUp() {
    return new Promise((resolve, reject) => {
      let closePromise = Promise.resolve();
      if (null !== this._hObj) {
        debug_info("Will be attempting MQ Close");
        closePromise = mq.ClosePromise(this._hObj, 0);
      }
      closePromise
      .then(() => {
        debug_info("Will be attempting MQ Disconnect");
        this._hObj = null;
        let disconnectPromise = Promise.resolve();
        if (null !== this._hconn) {
           disconnectPromise = mq.DiscPromise(this._hconn);
        }
        return disconnectPromise;
      })
      .then(() => {
        this._hconn = null;
        debug_info("Clean up was successfull");
        resolve();
      })
      .catch((err) => {
        debug_warn("Error in MQ connection cleanup ", err);
        this._hObj = null;
        this._hconn = null;
        // For now no, need to signal failure
        reject(err);
      })
    });
  }

  put(message) {
    return new Promise((resolve, reject) => {
      debug_info("Will be putting message ", message);

      // Check if connection has already been established.
      let connectionPromise = Promise.resolve();
      if (this._hconn === null || this === null) {
        connectionPromise = this.performConnection();
      }
      connectionPromise
      .then(() => {
        debug_info("Connected to MQ");
        return this.performPut(message);
      })
      .then(() => {
        debug_info("Message Posted");
        resolve('Message was posted successfully');
      })
      .catch((err) => {
        debug_warn("Failed to connect to MQ");
        debug_info(err);
        //If there is only a partial connection / open then clean up.
        //and signal tht there was a problem
        this.performCleanUp()
        .then(() => {
          reject(err)
        })
        .catch((cleanupErr) => {
          reject(err);
        })
      })
    });
  }

}

module.exports = MQClient;
