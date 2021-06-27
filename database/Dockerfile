FROM alpine:3.12.3

RUN    apk update \
    && apk add --no-cache bash tzdata mariadb mariadb-client mariadb-server-utils pwgen \
    && cp /usr/share/zoneinfo/Asia/Tokyo /etc/localtime \
    && mkdir /scripts \
    && rm -f /var/cache/apk/*

COPY ./entrypoint.sh /scripts/entrypoint.sh
RUN    mkdir /docker-entrypoint-initdb.d \
    && mkdir /scripts/pre-exec.d \
    && mkdir /scripts/pre-init.d \
    && chmod -R 755 /scripts

EXPOSE 3306

VOLUME ["/var/lib/mysql"]

ENTRYPOINT ["/scripts/entrypoint.sh"]

CMD ["--character-set-server=utf8mb4", "--collation-server=utf8mb4_unicode_ci"]
