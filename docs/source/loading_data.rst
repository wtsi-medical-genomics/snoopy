.. _loading-data:

Loading Data
############

There are a few choices to make when using snoopy: which mode to use and how to get to your data. The following usage matrix summarises the choices. Following this each use-case is discussed in more detail.


**I want to review...**

    A single set of sequence files/candidate variants
        My BAM files are local
            Use manual mode and load files within the browser
        My BAM files are on a remote server with HTTP/S access
            Use manual mode and load files from remote HTTP
        My BAM/CRAM files are on a remote server without HTTP/S access
            Use manual mode and load files with the SSH Bridge

    Several sets of sequence files/candidate variants
        My BAM files are local
            Use batch mode and load files from the local file server
        My BAM files are on a remote server with HTTP/S access
            Use batch mode and load files from remote HTTP
        My BAM/CRAM files are on a remote server without HTTP/S access
            Use batch mode and load files with the SSH Bridge


Modes
*****
There are two ways to use Snoopy: **manual mode** and **batch mode**.

Manual
======
    *Quickly load a few files and start QC with little preparation.*

In this mode, you select one-by-one a **single set** of sequence files (eg a single individual or a trio) and a list of candidate variant locations. Snoopy will then load the set of sequence files and visit each of the candidate variant locations.


Batch
=====
    *Review several sets of sequence files.*

In this mode, you can review **several** sets of sequence files (e.g. several sets of individuals or several different trios). As loading all of this information one-by-one with in the web interface would be cumbersome, the batch mode requires a JSON file which lists all of the sequence files and the variant locations. This file contains an array of **sessions**, where each session consists of:

* A set of sequence files (BAM, CRAM) which you want to view together at each of the locations in
* A list of variant locations (SNPs or CNVs) which you want to review in the sequence files.

For example, a session may consist of:

* a trio of sequence files :code:`mother.bam`, ``father.bam``, ``offspring.bam``
* a set of de novo sites which need to be verified ``chr5:96244805``, ``chr11:28483998``, ``chr12:106799289``, ...


Data Access
***********

Local Files
===========

Browser Load
------------
It is possible to load local files within the browser but there are some limitations. Firstly, as Dalliance, the genome browser Snoopy wraps around, does not yet provide support for CRAM, it is only possible to upload BAM files. Secondly, as you can only load one file at a time in a web browser you are restricted to manual mode.

Modes
    Manual

File types
    Bam

Command line arguments
    None


Local File Server
-----------------
If you have several local files you would like to view with batch mode Snoopy includes a local server. You will still be limited to BAM files however.

Modes
    Manual, Batch

File types
    Bam

Command line arguments
    ``--local-server``, ``-l`` (see :ref:`starting-snoopy` for more details)

Remote Files
============

HTTP/S
------
If your files exist on a remote HTTP/S server, you will be able to access these in either manual or batch mode. You will be limited to BAM files however.

Modes
    Manual, Batch

File types
    Bam

Command line arguments
    None

SSH Bridge
----------
The SSH Bridge is useful if: your files exist on a remote server but cannot be accessed by HTTP/S; your files are in CRAM format. The SSH bridge works in the following way:

1. Establish SSH connection to remote machine.
2. Dalliance will make an HTTP/S request to Snoopy's local server for a specific sequence file (x.bam) at a specific location (chr:start-end).
3. HTTP/S request is parsed and turned into a samtools commdand: `samtools view x.bam chr:start-end`.
4. The samtools command is sent, via SSH, to remote machine.
5. The results of the command is sent back to the local machine over SSH.
6. The output of the samtools command is parsed to JSON. 
7. JSON is served over local HTTP sever to the Dalliance browser.

This is the most flexible method, but as there quite a few steps involved in the process **this is also the slowest**.

Modes
    Manual, Batch

File types
    Bam, Cram

Command line arguments
    ``--ssh SSH``, ``-s`` (see :ref:`starting-snoopy` for more details)


Summary
=======

================== =========== ==============
Access mode        File Types  Mode
================== =========== ==============
Browser Load       BAM         Manual
Local File Server  BAM         Manual, Batch
HTTP/S             BAM         Manual, Batch
SSH Bridge         BAM, CRAM   Manual, Batch
================== =========== ==============

.. note::

    When loading Local BAM files through the browser, you will also need to specify the accompanying BAI file. For the other access modes, as long as the BAI files exist in the same directory and have corresponding file names (ie :code:`x.bam ==> x.bam.bai`) you do not need to explicitly load them.


Input File Formats
******************

.. _variant-list-file:

Variant List File
=================

The variant text file can list both SNPs and CNVs. SNPs can be in any of the following formats::

    chr:location
    chr-location
    chr,location
    chr location

The format for CNVs is as SNPs except the location consists of two numbers. For example, a CNV location may be 16:start-end.


Batch JSON File
===============

A JavaScript Object Notation (JSON) file is used to specify a set of sessions when using the batch mode of Snoopy. The idea is to use construct the JSON file with some scripting language (e.g. Python or Perl) rather than having to manually loading files. The general structure of the batch file is an array of sessions as follows::

    sessions:
        session 1:
            variants: array of variant locations | a file listing variant locations
            sequence_files: array of sequence files (BAM or CRAM)
        session 2:
            variants: array of variant locations | a file listing variant locations
            sequence_files: array of sequence files (BAM or CRAM)
        .
        .
        .

In the JSON format::

    {
        "sessions": [
            {
                "variants": [
                    "chr-loc",
                    "chr-loc",
                    "chr-loc"
                ],
                "sequence_files": [
                    "path/to/sequence file 1",
                    "path/to/sequence file 2",
                    "path/to/sequence file 3"
                ]
            },
            .
            .
            .
        ]
    }

The format of the variants takes the form as that in the :ref:`variant-list-file` section.

Example
-------
For an explicit example of a batch file::

    {
        "sessions": [
            {
                "variants": [
                    "16-48000491",
                    "16-48001121",
                    "16-48001200"
                ],
                "sequence_files": [
                    "/users/joe/examples/mother1.bam"
                    "/users/joe/examples/father1.bam"
                    "/users/joe/examples/offspring1.bam"
                ]
            },
            {
                "variants": [
                    "12-18001",
                    "12-1820491",
                    "14-1803735",
                    "15-1840848",
                ],
                "sequence_files": [
                    "/users/joe/examples/individual.bam"
                ]
            }
        ]
    }

.. note::

    To test whether yout JSON batch file is valid you can use the online tool `JSONLint <http://jsonlint.com/>`_
