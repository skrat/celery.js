#!/usr/bin/env node
var app = require('../celery');
var argv = require('optimist')
    .usage('Celery to Socket.IO gateway.\nUsage: celerygw -c [str]')
    .alias('c', 'config')
    .demand('c')
    .argv
;
app.main(argv);
