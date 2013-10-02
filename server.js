#!/bin/env node
//  OpenShift sample Node application

var express = require('express');
var http    = require('http')
  , path    = require('path');

var db = require("./lib/varnamdb");

// Create "express" server.
app  = express();

app.configure(function(){
  app.set('port', process.env.PORT || 8080);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.compress());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(app.router);
});

//  Get the environment variables we need.
var ipaddr  = process.env.VARNAM_IP_ADDRESS;
var port    = process.env.VARNAM_WEB_PORT || 3000;

if (typeof ipaddr === "undefined") {
   console.warn('No IP_ADDRESS environment variable');
}

//  terminator === the termination handler.
function terminator(sig) {
   if (typeof sig === "string") {
      console.log('%s: Received %s - terminating Node server ...',
                  Date(Date.now()), sig);
      process.exit(1);
   }
   console.log('%s: Node server stopped.', Date(Date.now()) );
}

//  Process on exit and signals.
process.on('exit', function() { terminator(); });

['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS',
 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGPIPE', 'SIGTERM'
].forEach(function(element, index, array) {
    process.on(element, function() { terminator(element); });
});

db.createSchema();

// Start the varnam worker instance which takes care of BG jobs
var forever = require('forever-monitor');
var child = new (forever.Monitor)('varnam_worker.js', {
    max: 1000,
    silent: false,
    options: []
});

child.on('exit', function () {
    console.log('varnam_worker has exited after many restarts');
});

child.start();

var routes  = require('./routes')

//  And start the app on that interface (and port).
app.listen(port, ipaddr, function() {
   console.log('%s: Node server started on %s:%d ...', Date(Date.now() ),
               ipaddr, port);
});

