
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

//console.log("Looking to run at ", process.env.PORT);

http.createServer(app).listen(8080);

debug_info('Server running at http://0.0.0.0:8080/');
