"use strict";

var tierMaster = {
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


function LoadedFile(file, name) {
    this.file = file || null;
    this.name = name || null;
}

function BAM(file, name, index) {
    this.base = LoadedFile;
    this.base(file, name);
    this.index = index || null;
 }

function LocalBAM(file) {
    this.base = LoadedFile;
    this.base(file, file.name + " [Local]");
    this.index = null;
}

LocalBAM.prototype = new BAM;

BAM.prototype.print = function(index, showDelete, backgroundColor) {
    if (typeof(showDelete) === "undefined") {
        showDelete = true;
    }
    var str = "<tr";
    if (backgroundColor) {
        str += " style='background-color: " + backgroundColor + "'";
    }
    str += "><td>";
    str += this.name;
    str += "</td><td>";
    if (!this.index) {
        str += "Missing index file";
    } else {
        str += "Index loaded";
    }
    str += "</td><td>";
    if (showDelete) {
        str  += "<a href=\"#\" onclick=\"removeBAM(";
        str += String(index);
        str += "); return false;\"> <span class=\"glyphicon glyphicon-trash\"></span></a>"
    }
    str += "</td></tr>";
    return str;
}

LocalBAM.prototype.getTier = function() {
    var tier = tierMaster; 
    tier["bamBlob"] = this.file;
    tier["baiBlob"] = this.index.file;
    tier["name"] = this.name;
    return tier;
}

function RemoteBAM(file) {
    this.base = LoadedFile;
    this.base(file, getName(file) + " [Remote]");
    this.index = true;

}

RemoteBAM.prototype = new BAM;

RemoteBAM.prototype.getTier = function() {
    var tier = tierMaster; 
    tier["bamURI"] = this.file;
    tier["name"] = this.name;
    tier["credentials"] = true;
    return tier;
}

function LocalBAI(file) {
    this.base = LoadedFile;
    this.base(file, file.name);
}

LocalBAI.prototype = new LoadedFile;

LocalBAI.prototype.print = function(index) {
    var str = "<tr><td>";
    str += this.name;
    str += "</td><td>";
    str += "Missing BAM file";
    str += "</td><td><a href=\"#\" onclick=\"removeBAI(";
    str += String(index);
    str += "); return false;\"> <span class=\"glyphicon glyphicon-trash\"></span></a></td></tr>";
    return str
}

function VariantFile(file, name) {
    this.base = LoadedFile;
    this.base(file, name);
}

VariantFile.prototype = new LoadedFile;

VariantFile.prototype.print = function(index, showDelete, backgroundColor) {
    if (typeof(showDelete) === "undefined") {
        showDelete = true;
    }
    var str = "<tr";
    if (backgroundColor) {
        str += " style='background-color: " + backgroundColor + "'";
    }
    str += "><td>";
    str += this.name;
    str += "</td><td>";
    str += "</td><td>";
    if (showDelete) {
        str += "<a href=\"#\" onclick=\"removeVariantFile(";
        str += String(index);
        str += "); return false;\"> <span class=\"glyphicon glyphicon-trash\"></span></a>";
    }
    str += "</td></tr>";
    return str
}

function LocalVariantFile(file) {
    this.base = LoadedFile;
    this.base(file, file.name + " [Local]");
}

LocalVariantFile.prototype = new VariantFile;

LocalVariantFile.prototype.get = function(sessionInstance) {
    var thatName = this.name;
    var reader = new FileReader();
    reader.readAsText(this.file);
    reader.onload = function() {
        sessionInstance.load(reader.result);
    };
};

function RemoteVariantFile(file) {
    this.base = LoadedFile;
    this.base(file, getName(file) + " [Remote]");
}

RemoteVariantFile.prototype = new VariantFile;

RemoteVariantFile.prototype.get = function(sessionInstance, dallianceBrowser) {
    $.ajax({
        url: this.file,
        xhrFields: { withCredentials: true }
    }).done(function(fileText) {
        console.log(fileText);
        sessionInstance.load(fileText, dallianceBrowser);
    });
};

function doesItExist(url, callback) {
    $.ajax({
        url: url,
        xhrFields: { withCredentials: true },
        headers : {Range: "bytes=0-1"}
    }).done(function() {
        return callback(true);
    }).fail(function() {
        return callback(false);
    });
}



