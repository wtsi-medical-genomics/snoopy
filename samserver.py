#!/usr/bin/env python

import sys, pysam, re, json
from SimpleHTTPServer import SimpleHTTPRequestHandler
from BaseHTTPServer import HTTPServer

URL_RE = re.compile(r'^/(.+)/(\w+):(\d+)-(\d+)$')

def reads_to_JSON(reads, chr_):
    listofdicts = []
    for read in reads:
        d = {}
        d['min'] = read.pos
        d['len'] = read.rlen
        d['segment'] = chr_
        d['readName'] = read.query_name
        d['mq'] = read.mapq
        d['cigar'] = read.cigarstring
        d['seq'] = read.seq
        d['quals'] = read.qual
        d['flag'] = read.flag
        listofdicts.append(d)
    return json.dumps(listofdicts)


class CORSRequestHandler(SimpleHTTPRequestHandler):

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Range')
        SimpleHTTPRequestHandler.end_headers(self)

    def do_GET(self):
        path_, chr_, min_, max_ = URL_RE.match(self.path).groups()
        min_, max_ = int(min_), int(max_)
        samfile = pysam.AlignmentFile(path_, "rb")
        reads = samfile.fetch(chr_, min_, max_)
        jso = reads_to_JSON(reads, chr_)
        print jso
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Content-length', len(jso))
        self.end_headers()
        self.wfile.write(jso)


if __name__ == "__main__":
    HandlerClass = CORSRequestHandler
    ServerClass  = HTTPServer
    Protocol     = "HTTP/1.0"

    if sys.argv[1:]:
        port = int(sys.argv[1])
    else:
        port = 8001
    server_address = ('127.0.0.1', port)

    HandlerClass.protocol_version = Protocol
    httpd = ServerClass(server_address, HandlerClass)

    sa = httpd.socket.getsockname()
    print "Serving HTTP on", sa[0], "port", sa[1], "..."
    httpd.serve_forever()
