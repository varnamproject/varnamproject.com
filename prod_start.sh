#!/bin/bash

cd ${VARNAM_WEB_ROOT_DIR}

export LD_LIBRARY_PATH=/usr/local/lib
export NODE_ENV=production

npm install

# Extract node.js script from package.json
APP_FILE=`node -e 'var package=require("./package.json");console.log(package.scripts.start.split(/ /)[1]);'`
# Backup server.log if exist
LOG_FILE=${VARNAM_LOG_DIR}/server.log
if [ -s $LOG_FILE ]; then
  # Get the modify time of the log file
  MODIFY=`stat -c "%Y" $LOG_FILE`
  # Convert to time stamp
  STAMP=`date -d @$MODIFY "+%Y%m%d-%H%M%S"`
  mv -f $LOG_FILE ${LOG_FILE}.${STAMP}.log
fi
node -v

echo "nohup supervisor $APP_FILE >$LOG_FILE 2>&1 &"
VARNAM_WEB_PORT=8080 nohup supervisor -w $APP_FILE $APP_FILE >$LOG_FILE 2>&1 &
VARNAM_WEB_PORT=8081 nohup supervisor -w $APP_FILE $APP_FILE >$LOG_FILE 2>&1 &
VARNAM_WEB_PORT=8082 nohup supervisor -w $APP_FILE $APP_FILE >$LOG_FILE 2>&1 &
VARNAM_WEB_PORT=8083 nohup supervisor -w $APP_FILE $APP_FILE >$LOG_FILE 2>&1 &
VARNAM_WEB_PORT=8084 nohup supervisor -w $APP_FILE $APP_FILE >$LOG_FILE 2>&1 &
nohup supervisor -w varnam_worker.js varnam_worker.js >${VARNAM_LOG_DIR}/worker.log 2>&1 &
