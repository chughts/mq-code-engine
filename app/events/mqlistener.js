const http = require('http');
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
    tellRegisteredEndpoints(msgData);
});

function tellRegisteredEndpoints(msgData) {
  debug_info('Will be informing registered endpoints');
  const parsedUrl = url.parse(regendpoint, true);
  const options = {
    host: parsedUrl.hostname,
    port: parsedUrl.port,
    path: parsedUrl.pathname,
    method: 'GET'
  };
  if (parsedUrl.search) {
    options.path += `${parsedUrl.search}`;
  }
  if (msgData && msgData['HexStrings'] && msgData['HexStrings'].MsgId) {
    options.path += msgData['HexStrings'].MsgId;
  }

  debug_info('http request options will be ', options);

  const req = http.request(options);
  // Invoked when the request is finished
  req.on('response', res => {
    debug_info(`STATUS: ${res.statusCode}`);
    debug_info(`HEADERS: ${util.inspect(res.headers)}`);
    res.setEncoding('utf8');
    res.on('data', chunk => { debug_info(`BODY: ${chunk}`); });
    res.on('error', err => { debug_info(`RESPONSE ERROR: ${err}`); });
  });
  // Invoked on errors
  req.on('error', err => { debug_warn(`REQUEST ERROR: ${err}`); });
  req.end();

}

// Start it pulsing
pulser.start();
