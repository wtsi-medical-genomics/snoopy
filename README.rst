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

::

    pip install snoopy


*******
Authors
*******

* Daniel Rice (dr9@sanger.ac.uk)
* Jeff Barrett


*************
Documentation
*************

All documentation is at `Read the Docs <http://snoopy.readthedocs.io/>`_.



FAQs
====

On Ubuntu, Failed building wheel for cryptography
-------------------------------------------------

Snoopy requires the python package paramiko which in turn requires cryptography. According to `this stackoverflow question <http://stackoverflow.com/questions/22073516/failed-to-install-python-cryptography-package-with-pip-and-setup-py>`_ in order to install cryptography on Debian and Ubuntu you must first::

    sudo apt-get install build-essential libssl-dev libffi-dev python-dev

and on Fedora and RHEL-derivatives::

    sudo yum install gcc libffi-devel python-devel openssl-devel


On Ubuntu, npm start fails with Error: watch ENOSPC
---------------------------------------------------

According to https://discourse.roots.io/t/gulp-watch-error-on-ubuntu-14-04-solved/3453 this is caused by a limit for how many files can be watched by a user and can be updated with::

    echo fs.inotify.max_user_watches=582222 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p




***********
Development
***********

To install snoopy for development purposes, if you don't have this already install `Node Version Manager <https://github.com/creationix/nvm>`_ and use it to install v4.4.5 of Node::
    
    $ nvm install v.4.4.5
    $ nvm use v4.4.5

Clone the repository::

    $ git clone --recursive https://github.com/wtsi-medical-genomics/snoopy.git

Build dalliance::
    
    $ cd snoopy/snoopy/dalliance
    $ npm install -g gulp
    $ npm install
    $ gulp

Build snoopy::

    $ cd .. // now in snoopy/snoopy/
    $ npm install
    $ npm start


*******
License
*******

Copyright (c) 2016 Genome Research Ltd.

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see http://www.gnu.org/licenses/.
