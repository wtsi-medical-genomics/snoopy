Overview
########
Snoopy is a tool designed to expedite the manual quality control of called variant sites in whole genome sequences. Given a set of sequence files (BAM/CRAM) and a list of questionable variant locations, Snoopy will present the reads at each variant location with the Dalliance genome browser. The user makes a judgement (variant or not variant) at each candidate variant. The results of these decisions are exported to a variety of human and machine friendly formats which can then be incorporated into your pipeline.

Usage
=====
Snoopy is launched from the command line and runs in the browser. Once started on the command line, Snoopy faciliates different ways to access your data depending on where it resides. The easiest and most performant means of data access is with HTTP access but as this isn't always possibile, Snoopy provides additional means of file access:

* a local http file server for local files
* an SSH-http bridge for remote files without http but can be accessed by SSH

(For more information on this please see Data Access section.)

In the browser, Snoopy provides an interface to record quality control decicions and to take snapshots for future reference. The sequence data is displayed using the Dalliance genome browser.


Requirments
===========
* Python (2 or 3)
* Pip
* Modern web browser (Chrome is recommended)

Installing
==========
::

    pip install snoopy