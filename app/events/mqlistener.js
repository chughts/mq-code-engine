const axios = require('axios');
//const http = require('http');
const url = require('url');
const util = require('util');
const MQEvents = require('./mqevents');
const pulser = new MQEvents();


let debug_info = require('debug')('mqcodeengine-mqlistener:info');
let debug_warn = require('debug')('mqcodeengine-mqlistener:warn');

let regendpoint = 'http://localhost:8080/api/mqgetbyid?msgid=';

// Handler function
pulser.on('mqevent', (msgData) => {
    debug_info(`${new Date().toISOString()} mqevent received`);
    debug_info('Message Data', msgData);
    tellRegisteredEndpoints(msgData)
    .then((data) => {
      debug_info('Invocation was successfull ', data);
    })
    .catch((err) => {
      debug_warn('Invocation failed ', err);
    });
});


function tellRegisteredEndpoints(msgData) {
  return new Promise((resolve, reject) => {
    debug_info('Will be informing registered endpoints');

    let uri = regendpoint;

    if (!msgData || !msgData['HexStrings'] || !msgData['HexStrings'].MsgId) {
      debug_warn('No MsgId found');
      reject('No MsgId provided');
    } else {
      uri += msgData['HexStrings'].MsgId;
      debug_info('Sending request to ', uri);

      axios({
        method: 'GET',
        url: uri
      })
      .then(function(response) {
        debug_info('Status code is ',  response.status);
        switch (response.status) {
          case 200:
          case 201:
            resolve(response.data);
            break;
          default:
            reject('Error Invoking API ', response.statusCode);
            break;
          }
        }).catch(function(err) {
          reject("REST call error : ", err);
        });
    }
  });
}




// Start it pulsing
pulser.start();
