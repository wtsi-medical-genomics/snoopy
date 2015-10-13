Guide
=====


Installing
----------


Overview of Use
---------------
In Snoopy, the manual quality control is split into sessions where each session consists of:

* A set of sequence files (BAM, CRAM) which you want to visualise simultanously.
* A list of variant locations (SNPs or CNVs) which you want to review in the sequence files.

A typical session is a trio (mother, father and offspring) at some called de novo sites. Note that you don't need to have more than one sequence file if you are concerned with only a single individual. Broadly, the steps to using Snoopy are:

1. Select sequence data (BAM, CRAM) and variant file.
2. Review each session.
3. Produce and download report of quality control decisions/snapshots.

This process will be discussed in detail in the following sections.

Data Access
-----------
There are several ways to access data, depending on which of the modes you choose to use Snoopy: manual or batch. In manual mode, you create a single session select one file (sequence data, list of variants) at a time. In this mode you are limited to viewing one set of sequence files at a time. In batch mode, you upload a JSON file specifying a batch of sessions which will be automatically parsed and prepared for viewing. Depending on which mode of use, Snoopy can gain access to files in a few modalities:


Local
^^^^^
It is possible to load files which reside on your local machine and this will also provide the fastest data access peformance. However, there are limitations. Firstly, as Dalliance, the underlying genome browser, does not yet provide full support for CRAM, it is only possible to upload BAM files. Secondly, you will be limited to only the manual mode.

Local File Server
^^^^^^^^^^^^^^^^^
Snoopy includes a local server which overcomes some of the limitations of local file access. That is, because your files can be accessed by a url (e.g. `https://127.0.0.1:8084/static/User/bob/case.bam`) you can use batch mode to load your session. You will be limited to BAM files however.

HTTP/S
^^^^^^
If your files exist on a remote HTTP/S server, you will be able to access in either manual or batch mode. You will be limited to BAM files however.

SSH Bridge
^^^^^^^^^^
If your files exist on a remote server but cannot be accessed by HTTP/S, you can use Snoopy's SSH bridge which works by

1. Establish SSH connection to remote machine.
2. Dalliance will make an HTTP/S request to Snoopy's local server for a specific sequence file (x.bam) a at a specific location (chr:start-end).
3. HTTP/S request is parse and turned into a samtools commdand: `samtools view x.bam chr:start-end`
4. The samtools command is sent, via SSH, to remote machine
5. On the local machine, output of the samtools command is parsed to JSON
6. JSON is proveded to Dalliance

As samtools is being used, this method has the benefit of being able to read CRAM files.

================== =========== ==============
Acces modes        File Types  Mode
================== =========== ==============
Local              BAM         Manual
Local File Server  BAM         Manual, Batch
HTTP/S             BAM         Manual, Batch
SSH Bridge         BAM, CRAM   Manual, Batch
================== =========== ==============

Loading BAI Files
^^^^^^^^^^^^^^^^^
When loading Local BAM files, you will also need to specify the accompanying BAI file. For the other access modes, as long as the BAI files exist in the same directory and have corresponding file names (ie x.bam ==> x.bam.bai) you do not need to explicitly load them.

Starting Snoopy
---------------
Snoopy is launched from the coammand line which will:

1. Start a local web server
2. Open Snoopy in a new browser tab or window

There are several command line options to specify when starting Snoopy which can be viewed at any time with ``$ snoopy --help``. These options are also summarised here:



Local File Server Options
^^^^^^^^^^^^^^^^^^^^^^^^^

-local-server-port, -p        Set the port number for Snoopy's local HTTP server.

                              **default**: 8084 or next available port.

-user                         By default, Snoopy uses a Username for local web server. If set, you will be prompted for a password.

                              **default**: username: snoopy password: peanuts
--no-auth                     Turn off digest authentication.

                              **default**: Authentication turned on.


Remote HTTP/S Server Options
^^^^^^^^^^^^^^^^^^^^^^^^^^^^
-remote-http, -r              If your files reside on a remote server with HTTP/S access, specify the remote HTTP server address.

                              **default**: No remote HTTP/S server
--remote-http-no-credentials  Specify if your remote HTTP/S server requires credentials for access.
    
                              **default**: Requires credentials

SSH Bridge Options
^^^^^^^^^^^^^^^^^^
-remote-ssh, -ssh             ``user@hostname`` If you want to use the SSH Bridge, specify the username and hostname of the remote host.

                              **default**: No SSH Bridge connection.

To start Snoopy, at the command line::

    $ snoopy <options>

Examples
^^^^^^^^
To start with an SSH Bridge with username gary at the server called deepblue::
    
    $ snoopy -remote-ssh=gary@deepblue

To start with a connection to a remote HTTP server at ``some.server.ac.uk``::
    
    $ snoopy -remote-http=some.server.ac.uk

To specify a different username/password that secures Snoopy's local web server::
    
    $ snoopy -user=joey

After which you will be prompted for a password for this username.

Save Your Options
^^^^^^^^^^^^^^^^^
If you are using a \*NIX machine, you can save your options in a text file and provide them as input using ``$(< args.txt)``. For example, in a file ``args.txt`` you can have::

    -local-server-port=8085 -remote-http=some.server.ac.uk -remote-ssh=gary@deepblue -user=gary

Then at the command line::

    snoopy.py $(<args.txt)


Load Your Data
--------------
As discussed in  `Data Access`_., there are two modes of using Snoopy: manual and batch. We'll walk through each of these modes now:

Manual
^^^^^^
In this mode, you can review only **one** set of sequence files (eg a single individual or a trio). To begin:

1. Start up snoopy, refer to `Starting Snoopy`_ for guidance.
2. Click "Go Manual"
3. Select a list of variants, refer to :doc:`/file_formats` for guidance.
4. Select BAM, BAI, CRAM files (see `Data Access`_ for guidance).
5. If all files are valid, click Proceed to QC.

Batch
^^^^^
In this mode, you can review **several** sets of sequence files (eg several single individual or several trios). To avoid having to manually select by hand each file to review in each session, the batch mode accepts a JSON file which lists all of the sequence files and the variant locations. :doc:`/file_formats` provides a detailed description of the batch JSON specification.

1. Start up snoopy, refer to `Starting Snoopy`_ for guidance.
2. Click "Go Batch"
3. Select the connection type that will be needed to access the data listed in the JSON file.
4. Select the JSON batch file (must be local).
5. If the batch file is valid and all sessions are loaded, click Proceed to QC.


Perform Quality Control
-----------------------
Now that 




