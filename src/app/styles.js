"use strict";

var styleSheets = 
{
    "raw": {
        "styles": [
            {
                "type": "density",
                "zoom": "low",
                "style": {
                    "glyph": "HISTOGRAM",
                    "COLOR1": "black",
                    "COLOR2": "red",
                    "HEIGHT": 30
                }
            },
            {
                "type": "density",
                "zoom": "medium",
                "style": {
                    "glyph": "HISTOGRAM",
                    "COLOR1": "black",
                    "COLOR2": "red",
                    "HEIGHT": 30
                }
            },
            {
                "type": "bam",
                "zoom": "high",
                "style": {
                    "glyph": "__SEQUENCE",
                    "HEIGHT": 8,
                    "BUMP": true,
                    "LABEL": false,
                    "ZINDEX": 20,
                    "__disableQuals": true,
                    "__INSERTIONS": false,
                }
            }
        ]
    },
    "coverage": {
        "styles": [
            {
                "type": "density",
                "zoom": "low",
                "style": {
                    "glyph": "HISTOGRAM",
                    "COLOR1": "gray",
                    "HEIGHT": 30
                }
            },
            {
                "type": "density",
                "zoom": "medium",
                "style": {
                    "glyph": "HISTOGRAM",
                    "COLOR1": "gray",
                    "HEIGHT": 30
                }
            },
            {
                "type": "base-coverage",
                "zoom": "high",
                "style": {
                    "glyph": "HISTOGRAM",
                    "COLOR1": "lightgray",
                    "BGITEM": true,
                    "HEIGHT": 30
                }
            }
        ]
    },
    "mismatch": {
        "styles": [
            {
                "type": "density",
                "zoom": "low",
                "style": {
                    "glyph": "HISTOGRAM",
                    "COLOR1": "black",
                    "COLOR2": "red",
                    "HEIGHT": 30
                }
            },
            {
                "type": "density",
                "zoom": "medium",
                "style": {
                    "glyph": "HISTOGRAM",
                    "COLOR1": "black",
                    "COLOR2": "red",
                    "HEIGHT": 30
                }
            },
            {
                "type": "bam",
                "zoom": "high",
                "style": {
                    "glyph": "__SEQUENCE",
                    "HEIGHT": 8,
                    "BUMP": true,
                    "LABEL": false,
                    "ZINDEX": 20,
                    "__SEQCOLOR": "mismatch",
                    "__INSERTIONS": false,
                    "_minusColor": "#87CEFA",
                    "_plusColor": "#FFA07A",
                }
            }
        ]
    },
     "condensed": {
        "styles": [
            {
                "type": "density",
                "zoom": "low",
                "style": {
                    "glyph": "HISTOGRAM",
                    "COLOR1": "black",
                    "COLOR2": "red",
                    "HEIGHT": 30
                }
            },
            {
                "type": "density",
                "zoom": "medium",
                "style": {
                    "glyph": "HISTOGRAM",
                    "COLOR1": "black",
                    "COLOR2": "red",
                    "HEIGHT": 30
                }
            },
            {
                "type": "bam",
                "zoom": "high",
                "style": {
                    "glyph": "__SEQUENCE",
                    "__SEQCOLOR": "mismatch",
                    "HEIGHT": 10,
                    "BUMP": true,
                    "LABEL": false,
                    "ZINDEX": 20,
                    "__CLEARBG": false,
                    "__disableQuals": true,
                    //"__INSERTIONS": "yes",
                    //"padding": 2,
                    "_minusColor": "#E8E8E8",
                    "_plusColor": "#E8E8E8",
                }
            }
        ]
    }
}

module.exports = styleSheets;