import os, os.path
import cherrypy

class Snoopy(object):
    @cherrypy.expose
    def index(self):
        return """<html>
      <body>
        hello
      </body>
    </html>"""
    
    @cherrypy.expose
    def ssh(self, qchr=0, qmin=0, qmax=0):
        return 'chr{}:{}-{}'.format(qchr, qmin, qmax)

if __name__ == '__main__':
    conf = {
        '/': {
            'tools.sessions.on': True,
            'tools.staticdir.root': '/'
            # 'tools.staticdir.root': os.path.abspath(os.getcwd())
        },
        '/static': {
            'tools.staticdir.on': True,
            'tools.staticdir.dir': '.'
        }
    }
    cherrypy.quickstart(Snoopy(), '/', conf)