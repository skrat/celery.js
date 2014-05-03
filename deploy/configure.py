#!/usr/bin/env python2

import os
import sys
import etcd
import json
import argparse
import ConfigParser

SOURCE_INI = '/usr/lib/node_modules/celerygw/example.ini'
RABBITMQ_PREFIX = '/rabbitmq'
PREFIX = '/celeryio'
PORT = 8080

parser = argparse.ArgumentParser(
    description="Create conf. file for celery to socket.io gateway.")
parser.add_argument('-v', '--vhost', dest='vhost')
parser.add_argument('-u', '--user', dest='user')

if __name__ == '__main__':
    host_ip = os.environ.get('COREOS_PRIVATE_IPV4', None)
    print("=> Connecting to etcd at %s" % host_ip)

    client = etcd.Client(host=host_ip, port=4001)
    client.set(PREFIX + '/service', json.dumps({'host': host_ip, 'port': PORT}))

    config = ConfigParser.ConfigParser()
    config.read(SOURCE_INI)

    args = parser.parse_args()
    vhost = args.vhost
    user = args.user
    password = client.get(RABBITMQ_PREFIX + '/users/' + user).value

    host = os.environ.get('MQ_PORT_5672_TCP_ADDR')
    port = os.environ.get('MQ_PORT_5672_TCP_PORT')

    config.set('amqp', 'host', host)
    config.set('amqp', 'port', port)
    config.set('amqp', 'vhost', vhost)
    config.set('amqp', 'user', user)
    config.set('amqp', 'password', password)
    config.write(sys.stdout)

