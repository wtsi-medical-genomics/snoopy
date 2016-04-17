#!/usr/bin/env python

import tornado.ioloop
import tornado.web
from tornado.web import RequestHandler, StaticFileHandler
from tornado.netutil import bind_sockets
from tornado.httpserver import HTTPServer
from tornado import gen
import re
import os
import argparse
import getpass
import base64
import json
from ssh_bridge import SSHBridge



SERVERS = {}

class SSH_Handler(RequestHandler):

    def initialize(self, username, password, hostname):
        self.set_header('Access-Control-Allow-Origin', '*')
        self._ssh_bridge = SSHBridge(username, password, hostname)
        self._RE_SEQ = re.compile(r'(.*)/(.*):(.*)-(.*)')
        self._RE_TXT = re.compile(r'(.*)') #(.*(\.(txt|json))?)

    @gen.coroutine
    def get(self, params):
        # /(.*):(.*)-(.*)
        m = self._RE_SEQ.match(params)
        if m:
            path, chrom, start, end = m.groups()
            fetched = yield self._ssh_bridge.fetch_sequence(path, chrom, start, end)
        else:
            m = self._RE_TXT.match(params)
            if m:
                path = m.groups()[0]
                fetched = yield self._ssh_bridge.fetch_plaintext(path)
        self.write(fetched)

class SettingsHandler(RequestHandler):
    
    @gen.coroutine
    def get(self):
        self.write(json.dumps({'servers': SERVERS}))


def main():

    DEFAULT_PORT = 4444 # 0
    handlers = [(r"/app/?(.*)", StaticFileHandler, {"path": 'build', "default_filename": "index.html"})]
    
    parser = argparse.ArgumentParser()
    parser.add_argument('--local-server', '-l',
        action='store_true',
        help='turn on local file server'
        )
    parser.add_argument('--port', '-p',
        type=int,
        help='set the local HTTP server port number. DEFAULT: {}, or next available port.'.format(DEFAULT_PORT),
        default=DEFAULT_PORT,
        )
    parser.add_argument('--ssh', '-s',
        help='user@hostname for SSH connection to sequence files on remote host. DEFAULT: <no SSH connection>'
        )
    args = parser.parse_args()
    
    print args

    if args.local_server:
        handlers.append((r"/files/(.*)", StaticFileHandler, {"path": "."}))

    if args.ssh:
        p = re.compile(r'^(.+)@(.+)$')
        m = p.match(args.ssh)
        if not m:
            return 'SSH location must have format user@hostname'
        g = m.groups()
        password = base64.b64encode(getpass.getpass('Enter the password for SSH connection {}: '.format(args.ssh)))
        ssh_config = {
            'username': g[0],
            'hostname': g[1],
            'password': password,
        }
        handlers.append((r"/ssh/(.*)", SSH_Handler, ssh_config))


    handlers.append((r"/settings", SettingsHandler))
    app = tornado.web.Application(handlers)
    sockets = bind_sockets(args.port, '')
    server = HTTPServer(app)
    server.add_sockets(sockets)
    port = sockets[0].getsockname()[1]
    print 'Listening on port', port 


    # Add server info for Snoopy web app to find information
    if args.local_server:
        SERVERS["localHTTP"] = {
                "type": "HTTP",
                "location": "http://localhost:{}/files/".format(port)
            }
    if args.ssh:
        SERVERS["SSHBridge"] = {
            "type": "SSHBridge",
            "localHTTPServer": "http://localhost:{}/ssh/".format(port),
            "remoteSSHServer": ssh_config['hostname'],
            "username": ssh_config['username']
        }

    tornado.ioloop.IOLoop.current().start()


if __name__ == "__main__":

    main()


