.. _starting-snoopy:

###############
Starting Snoopy
###############
To start Snoopy goto the command line and enter::

    $ snoopy <options>

Where options are summarised here:

-h, --help            show help message and exit

--local-server, -l    turn on local file server

                      DEFAULT: local-server not switched on

--port PORT, -p PORT  set the local HTTP server port number

                      DEFAULT: 4444, or next available port

--ssh SSH, -s SSH     user@hostname for SSH connection to sequence files on remote host

                      DEFAULT: SSH-Bridge not switched on

See the section :ref:`loading-data` for more information about these options.



********
Examples
********

Start local server
==================
::

    $ snoopy -l

Start local server at port 8888
===============================
::

    $ snoopy -l -p 8888

Start SSH-Bridge with username ``bob`` at ``big-bio-server``
================
::

    $ snoopy -s bob@big-bio-server
