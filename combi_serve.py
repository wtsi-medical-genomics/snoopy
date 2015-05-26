#!/usr/bin/env python
import sys
import os
import re
import paramiko
import getpass
import json
import webbrowser
import BaseHTTPServer
from SimpleHTTPServer import SimpleHTTPRequestHandler

paramiko.util.log_to_file('ssh.log')

class SSHBridge(object):

    def __init__(self):
        self.SAM_KEYS = {'QNAME':0, 'FLAG':1, 'RNAME':2, 'POS':3, 'MAPQ':4, 'CIGAR':5, 'MRNM':6, 'MPOS':7, 'TLEN':8, 'SEQ':9, 'QUAL':10}
        paramiko.util.log_to_file('ssh.log') # sets up logging


    def fetch(self, ssh_connection, path, lchr, lmin, lmax):
        c = 'samtools view {} {}:{}-{}'.format(path, lchr, lmin, lmax)
        print c
        ssh_stdin, ssh_stdout, ssh_stderr = ssh_connection.exec_command(c)
        return self.parse_samtools_view(ssh_stdout)
        # if not ssh_stderr:
        #     print 'about to go into parse_samtools_view'
            
        # else:
        #     print('ERROR: {}'.format(ssh_stderr))

    def parse_samtools_view(self, string):
        listofdicts = []
        for line in string:
            d = {}
            parts = line.split('\t')
            d['pos'] = int(parts[self.SAM_KEYS['POS']]) - 1
            d['len'] = len(parts[self.SAM_KEYS['SEQ']])
            d['segment'] = parts[self.SAM_KEYS['RNAME']]
            d['readName'] = parts[self.SAM_KEYS['QNAME']]
            d['mq'] = int(parts[self.SAM_KEYS['MAPQ']])
            d['cigar'] = parts[self.SAM_KEYS['CIGAR']]
            d['seq'] = parts[self.SAM_KEYS['SEQ']]
            d['quals'] = parts[self.SAM_KEYS['QUAL']]
            d['flag'] = int(parts[self.SAM_KEYS['FLAG']])
            listofdicts.append(d)
        return json.dumps(listofdicts)


class CombiHandler(SimpleHTTPRequestHandler):

    bridge = SSHBridge()
    ssh_connections = {}
    RE_JSON = re.compile(r'/(\w+)@(.+):(.+)/(?:chr)?([mxy0-9]{1,2}):(\d+)-(\d+)$', re.IGNORECASE)

    def do_GET(self):
        """Serve a GET request."""
        m = CombiHandler.RE_JSON.match(self.path)
        if m:
            user, server, path, lchr, lmin, lmax = m.groups()
            print user, server, path, lchr, lmin, lmax
            try:
                ssh_connection = CombiHandler.ssh_connections[(user, server)]
            except KeyError:
                ssh_connection = paramiko.SSHClient()
                ssh_connection.load_system_host_keys()
                ssh_connection.connect(server, username=user, password=getpass.getpass())
                CombiHandler.ssh_connections[(user, server)] = ssh_connection
            jso = CombiHandler.bridge.fetch(ssh_connection, path, lchr, lmin, lmax)
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Content-length', len(jso))
            self.end_headers()
            self.wfile.write(jso)
        else:
            SimpleHTTPRequestHandler.do_GET(self)


if __name__ == "__main__":
    HandlerClass = CombiHandler 
    ServerClass  = BaseHTTPServer.HTTPServer
    Protocol     = "HTTP/1.0"

    if sys.argv[1:]:
        port = int(sys.argv[1])
    else:
        port = 8883
    server_address = ('127.0.0.1', port)

    HandlerClass.protocol_version = Protocol
    httpd = ServerClass(server_address, HandlerClass)

    sa = httpd.socket.getsockname()
    print "Serving HTTP on", sa[0], "port", sa[1], "..."

    # path = os.path.join(os.getcwd(), 'index.html')
    webbrowser.open('http://127.0.0.1:{}/index.html'.format(port), new=2)
    
    httpd.serve_forever()