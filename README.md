Snoopy
======
Snoopy is a web-based variant quality control tool that makes use of the Dalliance genome viewer.

Reporting bugs / feature requests
=================================
Please log issues / feature requests with [GitHub's issue tracker](https://github.com/wtsi-medical-genomics/snoopy/issues). 

Development
===========
1. Snoopy and Dalliance use Node.js for it's package manager, NPM. The first step is to ensure this is all installed.
2. Before you build Snoopy you must first build Dalliance (included as a submodule). Following the dalliance's README.md, within the terminal, change directories to dalliance and run:

        (sudo?) npm install -g gulp
        npm install
        gulp compile

# npm install inspects the file package.json for any required packages and automatically installs these.
# gulp compile runs the task compile defined within gulpfile.js.

3. Change back to the Snoopy's root directory.
4. Run:

        npm install
        gulp

As with Dalliance, the required packages are installed and gulp runs (the default since no argument passed) to combine and minify code and to copy the relevant files into the dist directory.

5. The directory dist contains all of the files and code to run Snoopy. The file index.html is the main page of the app. 
