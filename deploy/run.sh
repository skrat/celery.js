#!/bin/sh

/configure.py -v $VHOST -u $USER > /celerygw.ini

RESTART_INTERVAL=$(((2*24*60*60)))

(
    while true ; do
        sleep $RESTART
        killall node
    done
) &

trap 'exit' SIGINT SIGTERM

while true ; do
    celerygw -c /celerygw.ini
done
