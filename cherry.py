#!/usr/bin/env python

import os, os.path
import cherrypy
import paramiko
import getpass
import json
import webbrowser
import pdb

class SSHBridge(object):

    def __init__(self):
        self.SAM_KEYS = {
            'QNAME':0,
            'FLAG':1,
            'RNAME':2,
            'POS':3,
            'MAPQ':4,
            'CIGAR':5,
            'SEQ':9,
            'QUAL':10
        }
        paramiko.util.log_to_file('ssh.log') # sets up logging


    def fetch(self, ssh_connection, path, lchr, lmin, lmax):
        if os.path.splitext(path)[1].lower() in ['.txt', '.json']:
            c = 'cat {}'.format(path)
            print c
            ssh_stdin, ssh_stdout, ssh_stderr = ssh_connection.exec_command(c)
            for error in ssh_stderr:
                if error.find('fail to open') >= 0:
                    return False

            return [line for line in ssh_stdout]

        else:
            c = 'samtools view {} {}:{}-{}'.format(path, lchr, lmin, lmax)
            print c
            ssh_stdin, ssh_stdout, ssh_stderr = ssh_connection.exec_command(c)

            for error in ssh_stderr:
                if error.find('fail to open') >= 0:
                    return False

            return self.parse_samtools_view(ssh_stdout)


    def parse_samtools_view(self, string):
        listofdicts = []
        for line in string:
            d = {}
            parts = line.split('\t')
            d['pos'] = int(parts[self.SAM_KEYS['POS']])
            # d['len'] = len(parts[self.SAM_KEYS['SEQ']])
            d['segment'] = parts[self.SAM_KEYS['RNAME']]
            d['readName'] = parts[self.SAM_KEYS['QNAME']]
            d['mq'] = int(parts[self.SAM_KEYS['MAPQ']])
            d['cigar'] = parts[self.SAM_KEYS['CIGAR']]
            d['seq'] = parts[self.SAM_KEYS['SEQ']]
            d['quals'] = parts[self.SAM_KEYS['QUAL']]
            d['flag'] = int(parts[self.SAM_KEYS['FLAG']])
            listofdicts.append(d)
        return json.dumps(listofdicts)


class Snoopy(object):

    ssh_connections = {}
    bridge = SSHBridge()

    @cherrypy.expose
    def ssh(self, user, server, path, lchr=0, lmin=0, lmax=0):
        L = ['user', 'server', 'path', 'lchr', 'lmin', 'lmax']
        s = ' \n '.join(['{v} = {s}'.format(s=eval(el), v=el) for el in L])
        print s
        try:
            ssh_connection = Snoopy.ssh_connections[(user, server)]
        except KeyError:
            ssh_connection = paramiko.SSHClient()
            ssh_connection.load_system_host_keys()
            ssh_connection.connect(server, username=user, password=getpass.getpass())
            Snoopy.ssh_connections[(user, server)] = ssh_connection
        payload = Snoopy.bridge.fetch(ssh_connection, path, lchr, lmin, lmax)
        if not payload:
            raise cherrypy.NotFound()
        else:
            return payload


if __name__ == '__main__':
    conf = {
        '/': {
            'tools.staticdir.root': '/'
        },
        '/app': {
            'tools.staticdir.on': True,
            'tools.staticdir.dir': os.path.join(os.path.abspath(os.getcwd()), 'build')[1:]
        },
        '/static': {
            'tools.staticdir.on': True,
            'tools.staticdir.dir': '.'
        }
    }
    webbrowser.open_new_tab('http://127.0.0.1:8080/app/index.html')
    cherrypy.quickstart(Snoopy(), '/', conf)
