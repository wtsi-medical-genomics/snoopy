#!/usr/bin/env python
import os, os.path
import paramiko
import getpass
import json
import cherrypy
from cherrypy.lib import auth_digest
import httplib
import argparse
import re


class SSHBridge(object):
    """
    SSHBridge(username, hostname)

    Establishes a SSH connection to username@hostname. Returns
     - (txt, json) from the host machine with `cat`. Returned as plaintext.
     - (bam, cram) from the host machine with `samtools view`. Returned as
       json for use with Dallinace's samjson source adapter.

    """

    def __init__(self, username, hostname):

        # set up logging
        paramiko.util.log_to_file('ssh.log')
        ssh_connection = paramiko.SSHClient()
        ssh_connection.load_system_host_keys()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh_connection.connect(
            hostname,
            username=username,
            password=getpass.getpass('Enter the password for SSH connection {}@{}: '.format(username, hostname))
            )
        self._ssh_connection = ssh_connection
        self._username = username
        self._hostname = hostname
        self._SAM_KEYS = {
            'QNAME':0,
            'FLAG':1,
            'RNAME':2,
            'POS':3,
            'MAPQ':4,
            'CIGAR':5,
            'SEQ':9,
            'QUAL':10
        }

    @property
    def username(self):
        return self._username

    @property
    def hostname(self):
        return self._hostname

    def fetch(self, path, lchr, lmin, lmax):
        """
        Fetches either sequence data or txt, json with the established
        ssh_connection.

        Parameters
        ----------
        path : str
            The path to the file on the server that wants to be fetched.
        lchr : str
            The chromosome at path. Relevant only if path points to a sequence
            (bam, cram) file
        lmin : str
            The minimum sequence coordinate/location to be fetched, if path
            points to a sequence (bam, cram) file
        lmax : str
            The maximum sequence coordinate/location to be fetched, if path
            points to a sequence (bam, cram) file

        Returns
        -------
        string : str
            Either a json string dump for sequence files or the plaintext for
            txt, json files.
        """

        ftype = os.path.splitext(path)[1].lower()
        if ftype in ['.txt', '.json']:
            c = 'cat {}'.format(path)
            ssh_stdin, ssh_stdout, ssh_stderr = self._ssh_connection.exec_command(c)
            for error in ssh_stderr:
                if error.find('fail to open') >= 0:
                    return False

            return [line for line in ssh_stdout]
        elif ftype in ['.bam', '.cram']:
            c = 'samtools view {} {}:{}-{}'.format(path, lchr, lmin, lmax)
            ssh_stdin, ssh_stdout, ssh_stderr = self._ssh_connection.exec_command(c)

            for error in ssh_stderr:
                if error.find('fail to open') >= 0:
                    return False

            return self.parse_samtools_view(ssh_stdout)

    def parse_samtools_view(self, samtools_view_output):
        """
        Parses the output of a samtools view command into a json string dump.

        Parameters
        ----------
        samtools_view_output : str
            A string of the returned samtools view output.

        Returns
        -------
        string : str
            A json string dump which is has been parsed so to be readily
            interpretred by Dalliance's samjson source adapter.

        """
        listofdicts = []
        for line in samtools_view_output:
            d = {}
            parts = line.split('\t')
            d['pos'] = int(parts[self._SAM_KEYS['POS']])
            # d['len'] = len(parts[self._SAM_KEYS['SEQ']])
            d['segment'] = parts[self._SAM_KEYS['RNAME']]
            d['readName'] = parts[self._SAM_KEYS['QNAME']]
            d['mq'] = int(parts[self._SAM_KEYS['MAPQ']])
            d['cigar'] = parts[self._SAM_KEYS['CIGAR']]
            d['seq'] = parts[self._SAM_KEYS['SEQ']]
            d['quals'] = parts[self._SAM_KEYS['QUAL']]
            d['flag'] = int(parts[self._SAM_KEYS['FLAG']])
            listofdicts.append(d)
        return json.dumps(listofdicts)


class Snoopy(object):
    """
    A class to expose the local server to the URL requests:

        127.0.0.1:port/ssh/
        127.0.0.1:port/servers/
    """

    @cherrypy.expose
    def ssh(self, user, server, path, lchr=0, lmin=0, lmax=0):
        """
        This method is used by cherrypy to handle requests made to
        /ssh/?...parameters... where URL parameters have been automatically
        parsed and passed in as method params.

        Parameters
        ----------
        path : str
            The path to the file on the server that wants to be fetched.
        lchr : str
            The chromosome at path. Relevant only if path points to a sequence
            (bam, cram) file
        lmin : str
            The minimum sequence coordinate/location to be fetched, if path
            points to a sequence (bam, cram) file
        lmax : str
            The maximum sequence coordinate/location to be fetched, if path
            points to a sequence (bam, cram) file
        """
        print cherrypy.request.method

        # Debugging helper, uncomment if you wnat to see the request parameters
        # print ' \n '.join(['{v} = {s}'.format(s=eval(el), v=el) for el in ['user', 'server', 'path', 'lchr', 'lmin', 'lmax']])

        # Make sure the requests username and hostname are the same for the Paramiko SSH connection
        if (Snoopy.bridge.username == user) and (Snoopy.bridge.hostname == server):
            payload = Snoopy.bridge.fetch(path, lchr, lmin, lmax)
        else:
            print('Do not have credentials for username {user} at host {server}'.format(user, server))
            return httplib.UNAUTHORIZED

        if not payload:
            raise cherrypy.NotFound()
        else:
            return payload

    @cherrypy.expose
    def servers(self):
        print 'hi'*50
        return json.dumps(Snoopy.settings)


def main():
    # Cherrypy configuration
    conf = {
        'global': {
            'tools.staticdir.root': '/',
            'server.socket_host' : '127.0.0.1',
            'server.socket_port' : 8084,
        },
        '/app': {
            'tools.staticdir.on': True,
            'tools.staticdir.dir': os.path.join(os.path.abspath(os.getcwd()), 'build')[1:],
        },
        '/local' : {
            'tools.staticdir.on': True,
            'tools.staticdir.dir': '.',
        }
    }
    user = 'snoopy'
    password = 'peanuts'

    parser = argparse.ArgumentParser()
    parser.add_argument('-local-server-port', '-p',
        type=int,
        help='set the local HTTP server port number. DEFAULT: {}, or next available port.'.format(conf['global']['server.socket_port'])
        )
    parser.add_argument('-remote-http', '-r',
        help='specify a remote HTTP server. DEFAULT: none.',
        default=''
        )
    parser.add_argument('--remote-http-no-credentials',
        dest='remote-http-credentials',
        action='store_false',
        help='specify if remote HTTP server requires credentials. DEFAULT: Requires credentials.'
        )
    parser.set_defaults(remote_http_credentials=True)

    parser.add_argument('-remote-ssh', '-ssh',
        help='user@hostname for SSH connection to sequence files on remote host. DEFAULT: <no SSH connection>'
        )
    parser.add_argument('-user',
        help='username for local web server. If set, you will be prompted for a password. DEFAULT: username:{} password:{}'.format(user, password)
        )
    parser.add_argument('--no-auth',
        dest='auth',
        action='store_false',
        help='turn off digest authentication. DEFAULT: Authentication turned on.'
        )
    parser.set_defaults(auth=True)

    args = parser.parse_args()
    print args
    if args.local_server_port:
        conf['global']['server.socket_port'] = args.local_server_port

    if args.remote_ssh:
        p = re.compile(r'^(.+)@(.+)$')
        m = p.match(args.remote_ssh)
        if not m:
            return 'SSH location must have format user@hostname'
        g = m.groups()
        ssh_config = {'username': g[0], 'hostname': g[1]}
        Snoopy.bridge = SSHBridge(**ssh_config)

    if args.auth:
        if args.user:
            user = args.user
            password = getpass.getpass('Please enter a password for the username {} you have provided to protect your local server: '.format(user))

        conf['global'].update({
            'tools.auth_digest.on': True,
            'tools.auth_digest.realm': 'realm',
            'tools.auth_digest.get_ha1': auth_digest.get_ha1_dict_plain({user: password}),
            'tools.auth_digest.key': 'a565c27146791cfd',
        })

    Snoopy.settings = {
        "servers": {
            "remoteHTTP": {
                "type": "HTTP",
                "location": args.remote_http,
                "requiresCredentials": args.remote_http_credentials
            },
            "localHTTP": {
                "type": "HTTP",
                "location": "http://{}:{}/local/".format(conf['global']['server.socket_host'], conf['global']['server.socket_port']),
                "requiresCredentials": args.auth
            },
            "SSHBridge": {
                "type": "SSHBridge",
                "localHTTPServer": "http://{}:{}/ssh/".format(conf['global']['server.socket_host'], conf['global']['server.socket_port']),
                "remoteSSHServer": ssh_config['hostname'],
                "username": ssh_config['username']
            }
        }
    }
    print conf
    cherrypy.quickstart(Snoopy(), '/', conf)


if __name__ == '__main__':
    main()
