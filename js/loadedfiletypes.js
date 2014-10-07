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


function variantLocations(variantFile) {
    this.variantArray = [];
    this.current = 0;
}


variantLocations.prototype.updateByList = function() {
    this.setQC();
    var selected = document.getElementById("mySelect");
    console.log(selected);
    this.current = selected.value;
    this.gotoCurrentVariant();
}

function setQC() {
    console.log("hello");
    console.log(parseInt(decision)); 
    v.setQC(parseInt(decision));
}

variantLocations.prototype.setQC = function() {
    console.log("setQC");
    var decision = $("#qcDecision input:radio:checked").val();
    if (decision !== undefined) {
        this.variantArray[this.current][2] = parseInt(decision);
        $("#qcDecision input:radio:checked").prop("checked", false);
        $("#qcDecision label").removeClass("active");
        this.refreshSelectList();
    }
}

variantLocations.prototype.processVariantFile = function(fileText) {
    var textArray = fileText.split("\n");
    var pattern = /\s*[-:,\s]+\s*/
for (var i = 0; i < textArray.length; i++) {
    var variant = textArray[i].trim();
    var parts = variant.split(pattern);
    var chr = parseInt(parts[0]);
    var loc = parseInt(parts[1]); 
    if (parts.length === 2) {
        this.variantArray.push([chr, loc, -99]);
    }
}


};

variantLocations.prototype.refreshSelectList = function() {

    var stringArray = this.getStringArray();
    var selectList = document.getElementById("mySelect"); 
    selectList.innerHTML = "";

    //Create and append the options
    for (var i = 0; i < stringArray.length; i++) {
        var option = document.createElement("option");
        option.value = i;
        option.text = stringArray[i];
        selectList.appendChild(option);
    }
};

variantLocations.prototype.getStringArray = function() {
    var stringArray = Array(this.variantArray.length);
    for (var i = 0; i<this.variantArray.length; i++) {
        var s = this.variantArray[i][0] + ":" + this.variantArray[i][1];
        switch (this.variantArray[i][2]) {
            case -1:
                s += " - not a variant";
            break;
            case 0:
                s += " - maybe a variant";
            break;
            case 1:
                s += " - variant";
            break;
        }
        stringArray[i] = s;
    }
    return stringArray;
};

variantLocations.prototype.gotoCurrentVariant = function() {
    console.log(this.current);
    console.log(this.variantArray); 
    var c = this.variantArray[this.current];
    document.getElementById("currentVariant").innerHTML = String(c[0]) + " : " + String(c[1]);
    b.setLocation("chr" + c[0], c[1] - 55, c[1] + 55);
    b.zoomStep(-1000000);
    document.getElementById("mySelect").value = this.current;


};

variantLocations.prototype.next = function() {
    this.setQC();
    if (this.current < this.variantArray.length - 1) {
        this.current++;
        this.gotoCurrentVariant();
    }
};

variantLocations.prototype.prev = function() {
    this.setQC();
    if (this.current > 0) {
        this.current--;
        this.gotoCurrentVariant();

    }
};


