#!/bin/bash

# get node user information
uid=$(id node -u)
gid=$(id node -g)

# change GID
if [ ${NODE_GID} -ne ${gid} ]; then
    groupmod -g ${NODE_GID} node
fi
# change UID
if [ ${NODE_UID} -ne ${uid} ]; then
    usermod -u ${NODE_UID} node
fi

# update owner
chown node:node /var/log/express
chown node:node /home/node
chown node:node /home/node/app
chown node:node package.json package-lock.json
chown node:node -R /home/node/app/node_modules
# execute process by node user
exec su-exec node /sbin/tini -e 143 -- "$@"
