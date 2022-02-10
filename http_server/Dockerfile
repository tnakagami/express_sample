FROM alpine:3.12.3

ENV WORK_ROOT_DIR=/src \
    SERVER_PORT=12001

# install basic software
RUN    apk update \
    && apk add --no-cache bash tzdata \
    && cp /usr/share/zoneinfo/Asia/Tokyo /etc/localtime \
    && apk add --no-cache python3 \
    && rm -rf /root/.cache /var/cache/apk/*

WORKDIR ${WORK_ROOT_DIR}
EXPOSE ${SERVER_PORT}

CMD ["python3", "/src/main.py"]
