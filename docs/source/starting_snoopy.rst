.. _starting-snoopy:

###############
Starting Snoopy
###############
To start Snoopy goto the command line and enter::

    $ snoopy <options>

Where the options are:

+-------------------------+------------------------------------------------+
| ``--help`` ``-h``       | show help message                              |
|                         |                                                |
|                         |                                                |
+-------------------------+------------------------------------------------+
| ``--local-server``      | turn on local file server                      |
| ``-l``                  |                                                |
|                         | **default**: turned off                        |
+-------------------------+------------------------------------------------+
| ``--port`` ``-p``       | set the local HTTP server ``PORT`` number      |
| ``{PORT}``              |                                                |
|                         | **default**: 4444                              |
+-------------------------+------------------------------------------------+
| ``--ssh`` ``-s``        | turn on SSH-Bridge with ``USER@HOSTNAME``      |
| ``{USER@HOSTNAME}``     |                                                |
|                         | **default**: turned off                        |
+-------------------------+------------------------------------------------+

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
============================================================
::

    $ snoopy -s bob@big-bio-server
