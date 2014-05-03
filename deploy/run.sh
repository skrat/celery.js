#!/bin/sh

/configure.py -u geri -v geri > /celerygw.ini

RESTART_INTERVAL=$(((2*24*60*60)))

(
    while true ; do
        sleep $RESTART_INTERVAL
        killall node
    done
) &

trap 'exit' SIGINT SIGTERM

while true ; do
    celerygw -c /celerygw.ini
done
