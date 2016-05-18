from setuptools import setup, find_packages
from codecs import open
from os import path

here = path.abspath(path.dirname(__file__))

with open(path.join(here, 'README.rst'), encoding='utf-8') as f:
    long_description = f.read()

setup(
    name='Snoopy',
    version='0.3.3',
    description='Snoopy is a web-based variant quality control tool',
    long_description=long_description,
    url='https://github.com/wtsi-medical-genomics/snoopy',
    author='Daniel Rice, Jeff Barrett',
    author_email='dr9@sanger.ac.uk, jb26@sanger.ac.uk',
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
    packages=find_packages(exclude=['docs', 'tests', 'gulp']),
    install_requires=['tornado', 'paramiko'],
    package_data={
        'snoopy': ['build/*'],
    },
    entry_points={
        'console_scripts': [
            'snoopy=snoopy:main',
        ],
    },
)