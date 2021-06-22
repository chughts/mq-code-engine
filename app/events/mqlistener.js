const MQEvents = require('./mqevents');
const pulser = new MQEvents();

let debug_info = require('debug')('mqcodeengine-mqlistener:info');
let debug_warn = require('debug')('mqcodeengine-mqlistener:warn');

// Handler function
pulser.on('mqevent', (msgData) => {
    debug_info(`${new Date().toISOString()} mqevent received`);
    debug_info('Message Data', msgData);
});

// Start it pulsing
pulser.start();
