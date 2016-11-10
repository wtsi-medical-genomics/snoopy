#!/usr/bin/env python

import tornado.ioloop
from tornado.web import RequestHandler, StaticFileHandler, Application
from tornado.netutil import bind_sockets
from tornado.httpserver import HTTPServer
from tornado import gen, ioloop
import re
import os
from argparse import ArgumentParser
from getpass import getpass
from base64 import b64encode
from json import dumps
import webbrowser
import threading
import signal
import sys
from .ssh_bridge import SSHBridge
from paramiko.ssh_exception import AuthenticationException
from socket import gaierror
SERVERS = {}

class SSH_Handler(RequestHandler):

    def initialize(self, username, password, hostname):
        # self.set_header('Access-Control-Allow-Origin', '*')
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
        self.write(dumps({'servers': SERVERS}))


def get_abs_path(path):
    here = os.path.dirname(__file__)
    return os.path.join(here, path)


def cli():

    DEFAULT_PORT = 4444 # 0
    handlers = [(r"/app/?(.*)", StaticFileHandler, {"path": get_abs_path('build'), "default_filename": "index.html"})]
    
    parser = ArgumentParser()
    parser.add_argument('-l', '--local-server',
        action='store_true',
        help='turn on local file server DEFAULT: local-server not switched on'
        )
    parser.add_argument('-p', '--port',
        type=int,
        help='set the local HTTP server port number DEFAULT: {}, or next available port'.format(DEFAULT_PORT),
        default=DEFAULT_PORT,
        )
    parser.add_argument('-s', '--ssh',
        type=str,
        help='user@hostname for SSH connection to sequence files on remote host DEFAULT: SSH-Bridge not switched on'
        )
    args = parser.parse_args()

    if args.local_server:
        handlers.append((r"/files/(.*)", StaticFileHandler, {"path": "."}))

    if args.ssh:
        p = re.compile(r'^(.+)@(.+)$')
        m = p.match(args.ssh)
        if not m:
            print('SSH location must have format user@hostname')
            sys.exit(0)
        g = m.groups()
        prompt = 'Enter the password for SSH connection {}: '.format(args.ssh)
        password = b64encode(getpass(prompt).encode())
        ssh_config = {
            'username': g[0],
            'hostname': g[1],
            'password': password,
        }
        
        #  Test ssh connection before going to the browser
        try:
            ssh = SSHBridge(**ssh_config)
        except AuthenticationException:
            print('\nERROR: Authentication failed for {username}@{hostname} -- are you using the correct credentials?\n'.format(**ssh_config))
            sys.exit()
        except gaierror:
            print('\nCould not ssh to {hostname}.\n'.format(**ssh_config))
            sys.exit()

        ssh.close()
        handlers.append((r"/ssh/(.*)", SSH_Handler, ssh_config))



    handlers.append((r"/settings", SettingsHandler))
    app = Application(handlers)
    sockets = bind_sockets(args.port, '')
    server = HTTPServer(app)
    server.add_sockets(sockets)
    port = sockets[0].getsockname()[1]
    print('Listening on port {}'.format(port))


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

    # Start tornado server.
    t = lambda: ioloop.IOLoop.current().start()
    tornado_thread = threading.Thread(target=t)
    tornado_thread.start()
    
    # Open new tab in default web browser.
    url = 'http://localhost:{}/app'.format(port)
    b = lambda : webbrowser.open(url, new=2)
    threading.Thread(target=b).start()

    # Kill on ^C
    try:
        while tornado_thread.is_alive():
            tornado_thread.join(timeout=1.0)
    except (KeyboardInterrupt, SystemExit):
        print('\n\n...stopping snoopy...\n')
        ioloop.IOLoop.current().stop()
        sys.exit(0)
    

if __name__ == '__main__':
    cli()