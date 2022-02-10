from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import threading
import logging
import logging.config
import os
import json
import signal
import time
import hashlib
from urllib.parse import urlparse, parse_qs

class SimpleDatabase():
    def __init__(self, value):
        self.__token = value
    
    @property
    def token(self):
        return self.__token
    @token.setter
    def token(self, value):
        self.__token = value

g_database = SimpleDatabase('')

class RequestServer(BaseHTTPRequestHandler):
    def __init__(self, logger, *args):
        self.__logger = logger
        super().__init__(*args)

    def do_GET(self):
        parsed = urlparse(self.path)
        target = parsed.path
        self.__logger.info(target)

        if target == '/logout/':
            g_database.token = ''
            self.create_response(200, '')
        else:
            self.create_response(404, 'Not Found')

    def do_POST(self):
        parsed = urlparse(self.path)
        target = parsed.path
        self.__logger.info(target)

        if target == '/login/':
            self.create_token()
        elif target == '/judge/':
            try:
                request = self.get_request()

                if g_database.token == request['token']:
                    status_code, message = 200, 'Success'
                else:
                    status_code, message = 401, 'Unauthorized'
            except Exception as err:
                self.__logger.warning(err)
                status_code, message = 500, err

            self.create_response(status_code, message)
        else:
            self.create_response(404, 'Not Found')

    def get_request(self):
        content_length = int(self.headers.get('content-length'))
        request = json.loads(self.rfile.read(content_length).decode('utf-8'))

        return request

    def create_response(self, status_code, message):
        data = {'message': message}
        response = json.dumps(data)
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json; charset=utf-8')
        self.end_headers()
        self.wfile.write(response.encode('utf-8'))

    def create_token(self):
        try:
            request = self.get_request()
            raw_param = '{}salt{}'.format(request['username'], request['password'])
            status_code, token = 200, hashlib.sha512(raw_param.encode()).hexdigest()
            g_database.token = '{}'.format(token)
        except Exception as err:
            self.__logger.warning(err)
            status_code, token = 500, ''

        data = {'token': token}
        response = json.dumps(data)
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json; charset=utf-8')
        self.end_headers()
        self.wfile.write(response.encode('utf-8'))

class HttpServer(threading.Thread):
    def __init__(self, port, logger):
        super().__init__()
        self.__port = port
        self.__logger = logger

    def run(self):
        def handler(*args):
            RequestServer(self.__logger, *args)
        
        self.__logger.info('Simple HTTP Server listening on port {}'.format(self.__port))
        self.server = ThreadingHTTPServer(('', self.__port), handler)
        self.server.serve_forever()
    
    def stop(self):
        self.server.shutdown()
        self.server.server_close()

class ProcessStatus():
    def __init__(self):
        self.__status = True

    def change_status(self, signum, frame):
        self.__status = False

    def get_status(self):
        return self.__status

if __name__ == '__main__':
    config_name = 'server'
    log_absolute_path = '/var/log/access.log'

    log_configure = {
        'version': 1,
        'disable_existing_loggers': False,
        'formatters': {
            'infoFormat': {
                'format': '[%(asctime)s %(levelname)s] %(name)s %(message)s',
                'datefmt': '%Y/%m/%d %H:%M:%S'
            }
        },
        'handlers': {
            'timeRotate': {
                'class': 'logging.handlers.TimedRotatingFileHandler',
                'formatter': 'infoFormat',
                'filename': log_absolute_path,
                'when': 'W2',
                'backupCount': 5
            },
            'consoleHandler': {
                'class': 'logging.StreamHandler',
                'formatter': 'infoFormat'
            }
        },
        'loggers': {
            config_name: {
                'level': 'INFO',
                'handlers': ['timeRotate', 'consoleHandler']
            }
        }
    }
    logging.config.dictConfig(log_configure)

    process_status = ProcessStatus()
    signal.signal(signal.SIGINT, process_status.change_status)
    signal.signal(signal.SIGTERM, process_status.change_status)

    try:
        port = int(os.getenv('SERVER_PORT', 12001))
        server = HttpServer(port, logging.getLogger(config_name))

        server.start()
        while process_status.get_status():
            time.sleep(0.1)
        server.stop()

    except Exception as err:
        print(err)
    
