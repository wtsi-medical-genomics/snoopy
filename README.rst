######
Snoopy
######

Browser based quality control tool to expedite reviewing predicted variants in next generation sequencing files.

************
Requirements
************

Snoopy has been tested on

* Mac OS X
* Ubuntu

And requires

* python (2 or 3)
* a modern web browser

If your files reside on a server without HTTP/S access snoopy can access this but will require a **samtools** to be installed and in your path.

************
Installation
************

Dalliance builds with::

    $ npm --version
    2.15.1
    $ node --version
    v4.4.3


After cloning the repository, install dependencies::

    npm install


Now you can run your local server::

    npm start


FAQs
====

On Linux, Failed building wheel for cryptography
------------------------------------------------

Snoopy requires the python package paramiko which in turn requires cryptography. According to `this stackoverflow question <http://stackoverflow.com/questions/22073516/failed-to-install-python-cryptography-package-with-pip-and-setup-py>`_ in order to install cryptography on Debian and Ubuntu you must first::

    sudo apt-get install build-essential libssl-dev libffi-dev python-dev

and on Fedora and RHEL-derivatives::

    sudo yum install gcc libffi-devel python-devel openssl-devel


*******
Authors
*******

* Daniel Rice (dr9@sanger.ac.uk)
* Jeff Barrett


*************
Documentation
*************

All docuomentation is at `Read the Docs <http://snoopy.readthedocs.io/>`_.


*******
License
*******

Copyright (c) 2016 Genome Research Ltd.

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see http://www.gnu.org/licenses/.
