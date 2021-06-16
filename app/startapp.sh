#!/bin/bash
export LD_LIBRARY_PATH=/app/node_modules/ibmmq/redist/lib64
export MQ_INSTALLATION_PATH=/app/node_modules/ibmmq/redist
#export LD_LIBRARY_PATH=/opt/mqm/lib64
#export MQ_INSTALLATION_PATH=/opt/mqm/redist
DEBUG=mqcodeengine* node server.js
