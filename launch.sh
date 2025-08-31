#!/usr/bin/env bash
if [ ! -z "$HOST_ENTRY" ]; then
  echo $HOST_ENTRY >>/etc/hosts
fi
node server/lib/server.js
