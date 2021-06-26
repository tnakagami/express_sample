FROM node:16-alpine3.11

ENV WORK_ROOT_DIR=/home/node/app \
    NODE_UID=1000 \
    NODE_GID=1000 \
    SERVER_PORT=11500

# install basic software
RUN    apk update \
    && apk add --no-cache bash tzdata shadow su-exec tini \
    && cp /usr/share/zoneinfo/Asia/Tokyo /etc/localtime \
    && mkdir -p ${WORK_ROOT_DIR} \
    && mkdir -p /var/log/express \
    && mkdir -p /home/node/src \
    && rm -rf /root/.cache /var/cache/apk/*

COPY ./package.json ${WORK_ROOT_DIR}/package.json
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN    chmod +x /usr/local/bin/entrypoint.sh \
    && cd ${WORK_ROOT_DIR} \
    && npm install

WORKDIR ${WORK_ROOT_DIR}

EXPOSE ${SERVER_PORT}

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["npm", "start"]
