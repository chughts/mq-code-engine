const EventEmitter = require('events');
const MQClient = require('../mqclient');
let mqclient = new MQClient();

let debug_info = require('debug')('mqcodeengine-mqevents:info');
let debug_warn = require('debug')('mqcodeengine-mqevents:warn');

const INTERVAL = 8000;

class MQEvents extends EventEmitter {
    start() {
        setInterval(() => {
            this.performMQQueueCheck()
            .then((msgData) => {
              debug_info('Found Message ', msgData);
              debug_info(`${new Date().toISOString()} >>>> pulse`);
              if (msgData) {
                this.emit('mqevent', msgData);
              }
              debug_info(`${new Date().toISOString()} <<<< pulse`);
            })
            .catch((err) => {
              debug_warn('Error detected in MQEvents EventEmitter ', err);
            })
        }, INTERVAL);
    }

    performMQQueueCheck() {
      return new Promise((resolve, reject) => {
        debug_info('Checking MQ for Messages');
        mqclient.browse()
        .then((msgData) => {
          resolve(msgData);
        })
        .catch((err) => {
          reject(err);
        })
      });
    }
}

module.exports = MQEvents;
