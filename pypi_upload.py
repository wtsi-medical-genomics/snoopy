#!/usr/bin/env python

# USAGE
# ./pypi_upload.py <version> <testing:true/false>


import sys
import re
import json
import shutil
import subprocess
from collections import OrderedDict

def update_version(version, test):
    fpath = './snoopy/__init__.py'
    with open(fpath, 'w') as f:
        f.write('__version__ = "{}"'.format(version))

    fpath = './setup.py'
    p = re.compile(r'\s+version=(?:\'|\")(?P<version>[0-9a-zA-Z.]+)(?:\'|\"),')
    with open(fpath) as f:
        lines = f.readlines()
    with open(fpath, 'w') as f:
        for line in lines:
            m = p.match(line)
            if m:
                previous_version = m.group('version')
                line = line.replace(previous_version, version)
            f.write(line)

    fpath = './snoopy/package.json'
    with open(fpath) as f:
        j = json.load(f, object_pairs_hook=OrderedDict)
    j['version'] = version
    with open(fpath, 'w') as f:
        json.dump(j, f, indent=2)


def remove_previous_build():
    dirs = 'dist', 'build', 'snoopy.egg-info'
    for d in dirs:
        shutil.rmtree(d, ignore_errors=True)


def upload():
    # Create a universal wheel
    return_code = subprocess.call("python setup.py bdist_wheel --universal", shell=True)
    assert return_code == 0

    if test:
        # Upload to testpypi.python.org
        return_code = subprocess.call("twine upload -r test dist/*", shell=True)
        assert return_code == 0
    else:
        # Upload to pypi.python.org
        return_code = subprocess.call("twine upload -r pypi dist/*", shell=True)
        assert return_code == 0


if __name__ == '__main__':
    version = sys.argv[1]
    if len(sys.argv) == 3:
        test = bool(sys.argv[2])
    else:
        test = False

    print('Using version {}'.format(version))
    if test:
        print('Uploading to https://testpypi.python.org')
    else:
        print('Uploading to https://pypi.python.org')
    update_version(version, test)
    remove_previous_build()
    upload()
