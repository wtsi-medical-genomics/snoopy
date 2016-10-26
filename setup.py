from setuptools import setup, find_packages
from codecs import open
import os


here = os.path.abspath(os.path.dirname(__file__))

with open(os.path.join(here, 'README.rst'), encoding='utf-8') as f:
    long_description = f.read()

package_data = []
os.chdir(os.path.join(here, 'snoopy'))
for (path, directories, filenames) in os.walk('build'):
    path = path
    for filename in filenames:
        package_data.append(os.path.join(path, filename))
os.chdir('..')

setup(
    name='snoopy',
    version='0.4.4',
    description='Browser based quality control tool to expedite reviewing predicted variants in next generation sequencing files.',
    long_description=long_description,
    url='https://github.com/wtsi-medical-genomics/snoopy',
    author='Daniel Rice',
    author_email='dr9@sanger.ac.uk',
    license='MIT',
    classifiers=[
        'Development Status :: 4 - Beta',
        'Intended Audience :: Science/Research',
        'Topic :: Scientific/Engineering :: Bio-Informatics',
        'License :: OSI Approved :: MIT License',
        'Operating System :: POSIX',
        'Operating System :: MacOS',
        'Environment :: Web Environment',
        'Programming Language :: Python :: 2',
        'Programming Language :: Python :: 2.6',
        'Programming Language :: Python :: 2.7',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.3',
        'Programming Language :: Python :: 3.4',
        'Programming Language :: Python :: 3.5',
    ],
    keywords='quality control qc variants next generation sequencing bam cram',
    packages=find_packages(exclude=['docs', 'tests']),
    install_requires=['tornado', 'paramiko'],
    package_data={
        'snoopy': package_data,
    },
    entry_points={
        'console_scripts': [
            'snoopy=snoopy.snoopy:cli',
        ],
    },
)