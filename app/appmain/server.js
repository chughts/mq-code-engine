
let debug_info = require('debug')('mqcodeengine-server:info');
let debug_warn = require('debug')('mqcodeengine-server:warn');

debug_info("Before Process env settings are: ");
debug_info("LD_LIBRARY_PATH : ", process.env.LD_LIBRARY_PATH);
debug_info("MQ_INSTALLATION_PATH : ", process.env.MQ_INSTALLATION_PATH);

// process.env.LD_LIBRARY_PATH = "/app/node_modules/ibmmq/redist/lib64";
// process.env.MQ_INSTALLATION_PATH = "/app/node_modules/ibmmq/redist";
//
// console.log("After Process env settings are: ");
// console.log("LD_LIBRARY_PATH : ", process.env.LD_LIBRARY_PATH);
// console.log("MQ_INSTALLATION_PATH : ", process.env.MQ_INSTALLATION_PATH);

const app = require('./mqapp');
const http = require('http');

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);
  if (isNaN(port)) {
    // named pipe
    return val;
  }
  if (port >= 0) {
    // port number
    return port;
  }
  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      debug_warn(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      debug_warn(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug_info('Listening on ' + bind);
}

//console.log("Looking to run at ", process.env.PORT);
var port = normalizePort(process.env.PORT || '8080');
app.set('port', port);

//http.createServer(app).listen(8080);

var server = http.createServer(app);

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);


//debug_info('Server running at http://0.0.0.0:8080/');
