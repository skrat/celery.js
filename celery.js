var fs = require('fs'),
    ini = require('ini'),
    url = require('url'),
    amqp = require('amqp'),
    http = require('http'),
    io = require('socket.io'),
    msgpack = require('msgpack2'),
    sys = require(process.binding('natives').util ? 'util' : 'sys');

var conf, conn, sock;


function brokerReady() {
    var defaultExchange = conn.exchange(conf.celery.exchange, {
        type: conf.celery.type,
        durable: true,
        autoDelete: false
    });

    sock.sockets.on('connection', function(client) {
        client.on(conf.celery.taskevent, function(message) {
            resultQueue(conn, message, function(result) {
                client.emit(conf.celery.resultevent, result);
            });
            var ex = defaultExchange;
            var route = conf.celery.route;
            if (message.exchange) {
                ex = conn.exchange(message.exchange, {
                    type: conf.celery.type,
                    durable: true,
                    autoDelete: false
                });
                route = message.exchange;
            }
            ex.publish(route, pack(message), {
                contentType: 'application/x-msgpack',
                contentEncoding: 'binary'
            });
        });
        client.on('disconnect', function() {
            // TODO flush callbacks
        });
    });
}


function resultQueue(conn, task, callback) {
    var queueName = task.id.replace(/-/g, '');
    var args = {};
    if ('resultexpires' in conf.celery) {
        args['x-expires'] = parseInt(conf.celery.resultexpires);
    }
    conn.queue(queueName, {'arguments': args}, function(queue) {
        queue.subscribe(function(message, headers, deliveryInfo) {
            callback(msgpack.unpack(new Buffer(message.data)));
            queue.destroy();
        });
    });
}


function pack(message) {
    // workaround for amqp's buffer type check
    var sbuf = msgpack.pack(message);
    var buf = new Buffer(sbuf.length);
    sbuf.copy(buf);
    return buf;
}


function main(argv) {
    conf = ini.decode(fs.readFileSync(argv.config).toString());
    var server = http.createServer(function(req, res) {
        res.writeHead(200);
    });
    server.listen(parseInt(conf.socketio.listen));
    sock = io.listen(server);
    conn = amqp.createConnection(conf.amqp);
    conn.addListener('ready', brokerReady);
}
exports.main = main;
