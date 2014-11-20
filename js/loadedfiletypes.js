"use strict";

function LoadedFile(file) {
    this.file = file || null;
}

LoadedFile.prototype.print = function(message) {
}

function LoadedBamFile(file) {
    this.base = LoadedFile;
    this.base(file);
    this.index = null;
}

LoadedBamFile.prototype = new LoadedFile;

LoadedBamFile.prototype.print = function(index) {
    var str = "<tr><td>";
    str += this.file.name;
    str += "</td><td>";
    if (!this.index) {
        str += "Missing index file";
    } else {
        str += "Index loaded";
    }
    str += "</td><td><a href=\"#\" onclick=\"removeBAM(";
    str += String(index);
    str += "); return false;\"> <span class=\"glyphicon glyphicon-trash\"></span></a></td></tr>";
    return str;
}

LoadedBamFile.prototype.getTier = function() {
    var tier = {
        baiBlob : this.index.file,
        bamBlob : this.file,
        name : this.file.name, 
        noPersist : true,
        subtierMax : 1000,
        style: [
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
                "__SEQCOLOR": "mismatch"
            }
        }
        ]
    };
    return tier;
}

function RemoteBam(file) {
    this.base = LoadedFile;
    this.base(file);
    this.name = getName(file);
}

RemoteBam.prototype = new LoadedFile;

RemoteBam.prototype.print = function(index) {
    var str = "<tr><td>";
    str += this.name;
    str += "</td><td>";
    str += "</td><td><a href=\"#\" onclick=\"removeBAM(";
    str += String(index);
    str += "); return false;\"> <span class=\"glyphicon glyphicon-trash\"></span></a></td></tr>";
    console.log('remotebam print');
    return str;
}


RemoteBam.prototype.getTier = function() {
    var tier = {
        bamURI : "https://web-lustre-01.internal.sanger.ac.uk/" + this.file,
        name : this.name, 
        credentials : true,
        noPersist : true,
        subtierMax : 1000,
        style: [
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
                "__SEQCOLOR": "mismatch"
            }
        }
        ]
    };
    return tier;
}

function LoadedBaiFile(file) {
    this.base = LoadedFile;
    this.base(file);
}

function removeBAM(index) {
    if (typeof(index) === "string") {
       index = parseInt(index);
    }
    bamFiles.splice(index, 1);
    printFilesTable();
}

LoadedBaiFile.prototype = new LoadedFile;

LoadedBaiFile.prototype.print = function(index) {
    var str = "<tr><td>";
    str += this.file.name;
    str += "</td><td>";
    str += "Missing BAM file";
    str += "</td><td><a href=\"#\" onclick=\"removeBAI(";
    str += String(index);
    str += "); return false;\"> <span class=\"glyphicon glyphicon-trash\"></span></a></td></tr>";
    return str
}

function removeBAI(index) {
    if (typeof(index) === "string") {
        index = parseInt(index);
    }
    baiFiles.splice(index, 1);
    printFilesTable();
}

function LoadedVariantFile(file) {
    this.base = LoadedFile;
    this.base(file);
}

LoadedVariantFile.prototype = new LoadedFile;

LoadedVariantFile.prototype.print = function(index) {
    var str = "<tr><td>";
    str += this.file.name;
    str += "</td><td>";
    str += "</td><td><a href=\"#\" onclick=\"removeVariantFile("
    str += String(index)
    str += "); return false;\"> <span class=\"glyphicon glyphicon-trash\"></span></a></td></tr>";
    return str
}

function RemoteVariantList(file) {
    this.base = LoadedFile;
    this.base(file);
    this.name = getName(file);
}

RemoteVariantList.prototype = new LoadedFile;

RemoteVariantList.prototype.print = function(index) {
    var str = "<tr><td>";
    str += this.name;
    str += "</td><td>";
    str += "</td><td><a href=\"#\" onclick=\"removeVariantFile("
    str += String(index)
    str += "); return false;\"> <span class=\"glyphicon glyphicon-trash\"></span></a></td></tr>";
    return str;
}


function removeVariantFile(index) {
    if (typeof(index) === "string") {
        index = parseInt(index);
    }
    variantFiles.splice(index, 1);
    printFilesTable();
}

function LoadedFilesList(files) {
    this.files = files || [];
}

LoadedFilesList.prototype.contains = function(file) {
    for (var i=0; i < this.files.length; ++i) {
        if (this.files[i].name === file.name) {
            return true;
        }
    }
    return false;
}

LoadedFilesList.prototype.add = function(file) {
    this.files.push(file)
}

LoadedFilesList.prototype.length = function() {
    return this.files.length;
}

function getExtension(f) {
    if (typeof(f) !== "string") {
        f = f.name;
    }
    var parts = f.split(".");
    return parts[parts.length - 1].toLowerCase();
};

function getName(f) {
    if (typeof(f) !== "string") {
        f = f.name;
    }
    var parts = f.split("/");
    return parts[parts.length - 1];
};

var fileArrayContains = function(fArray, fname) {
    for (var i=0; i < fArray.length; ++i) {
        var f = fArray[i];      
        if (f.file.name === fname) {
            return i;
        }
    }
    return -1;
};

var printfArray = function(fArray) {
    var str = ""
    for (var i=0; i < fArray.length; ++i) {
        str += fArray[i].print(i);
    }
    return str;
}

