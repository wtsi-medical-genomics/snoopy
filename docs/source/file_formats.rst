File Formats
============

Variant List File
-----------------
The variant text file can list both SNPs and CNVs. SNPs can be in any of the following formats::

    chr:location
    chr-location
    chr,location
    chr location

The format for CNVs is as SNPs except the location consists of two numbers. For example, a CNV location may be 16:start-end.


Batch JSON File
---------------
A JavaScript Object Notation (JSON) file is used to specify a set of sessions when using the batch mode of Snoopy. The idea is to use construct the JSON file with some scripting language (e.g. Python or Perl) rather than having to manually loading files. The general structure of the batch file is an array of sessions as follows::

    sessions:
        session 1:
            variants: array of variant locations | a file listing variant locations
            bams: array of sequence files (BAM or CRAM)
        session 2:
            variants: array of variant locations | a file listing variant locations
            bams: array of sequence files (BAM or CRAM)
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
                "bams": [
                    "sequence.bam | cram",
                    "sequence.bam | cram",
                    "sequence.bam | cram"
                ]
            },
            .
            .
            .
        ]
    }

The format of the variants takes the form as that in the `Variant List File`_ section.

Example
^^^^^^^
For an explicit example of a batch file::

    {
        "sessions": [
            {
                "variants": [
                    "16-48000491",
                    "16-48001121",
                    "16-48001200"
                ],
                "bams": [
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
                "bams": [
                    "/users/joe/examples/individual.bam"
                ]
            }
        ]
    }

JSON File Validation
^^^^^^^^^^^^^^^^^^^^
To test whether yout JSON batch file is valid you can use the online tool `JSONLint <http://jsonlint.com/>`_