"use strict";

function LoadedFile(file, remote) {
    this.file = file || null;
    this.remote = remote || null;
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
                                                       return str
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



//LoadedBaiFile.prototype.print = function() {
//    this.__proto__.print("No BAM File Found");
//}

function LoadedVariantFile(file) {
    this.base = LoadedFile;
    this.base(file);
}

LoadedVariantFile.prototype = new LoadedFile;

//LoadedVariantFile.prototype.print = function() {
//    return this.file.name;
//}


LoadedVariantFile.prototype.print = function(index) {
    var str = "<tr><td>";
    str += this.file.name;
    str += "</td><td>";
    str += "</td><td><a href=\"#\" onclick=\"removeVariantFile("
                                                               str += String(index)
                                                               str += "); return false;\"> <span class=\"glyphicon glyphicon-trash\"></span></a></td></tr>";
                                                               return str
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

var getExtension = function(file) {
    var parts = file.name.split(".");
    return parts[parts.length - 1].toLowerCase();
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


