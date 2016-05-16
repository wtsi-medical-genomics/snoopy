.. _saving-results:

##############
Saving Results
##############

****
JSON
****
It is possible to export JSON files with the same as described in :ref:`batch-json-file` augmented with your QC decisions and any snapshot names (see next section) that you may have taken. The general structure is::

    {
        "date": <date JSON file created>,
        "sessions": [
            {
                "sequence_files": [
                    "path/to/sequence file 1",
                    "path/to/sequence file 2",
                    "path/to/sequence file 3"
                ],
                "variants": [
                    {
                      "chr": <chr of variant>,
                      "location": <base position of variant>,
                      "qc_decision": <decision made when reviewing>,
                      "snapshot": <PNG filename>
                    },
                    .
                    .
                    .
                ]
            },
            .
            .
            .
        ]
    }

*********
Snapshots
*********
To accompany your QC decisions, a zip file of PNG snapshots can also be saved. These images are generated automatically if specified in :ref:`settings` or when clicking the snapshot button :ref:`snoopy-ui`. The filesnames of the snapshots are formed by concatenating the sequence files and the variant location.

****
HTML
****
The HTML export is a convenient file which combines the JSON results and snapshots described in the sections above into a single standalone file. When opened in a web-browser (it is a static file so no web-server is needed) you can click through the sessions and variants to view recorded QC decisions and snapshots.