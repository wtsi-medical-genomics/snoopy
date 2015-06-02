"use strict";

var getName = require('./utils.js').getName;

function LoadedFile(file, name, id) {
    this.file = file || null;
    this.name = name || null;
    this.id = id || null;
}


// function uuid() {
//     /*jshint bitwise:false */
//     var i, random;
//     var uuid = '';

//     for (i = 0; i < 32; i++) {
//         random = Math.random() * 16 | 0;
//         if (i === 8 || i === 12 || i === 16 || i === 20) {
//             uuid += '-';
//         }
//         uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random))
//             .toString(16);
//     }
//     return uuid;
// }

function BAM(file, name, id, index) {
    this.base = LoadedFile;
    this.base(file, name, id);
    this.index = index || null;
    this.tier = {
       noPersist: true,
       subtierMax: 1000
    };
 }


function BAI(file, name, id, mapping) {
    this.base = LoadedFile;
    this.base(file, name, id);
    this.mapping = mapping || null;
 }


function LocalBAM(file, id) {
    this.base = BAM;
    this.base(file, file.name, id);
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

LocalBAM.prototype.getTier = function(style) {
    this.tier["bamBlob"] = this.file;
    this.tier["baiBlob"] = this.index.file;
    this.tier["name"] = this.name;
    this.tier["style"] = style;
    this.tier["padding"] = 0;
    this.tier["scaleVertical"] = true;
    return this.tier;
}

function RemoteBAI(file, id) {
    this.base = BAI;
    this.base(file, getName(file), id, true);
}

RemoteBAI.prototype = new BAI;

function RemoteBAM(file, id) {
    this.base = BAM;
    this.base(file, getName(file), id);
    this.index = true;
}

RemoteBAM.prototype = new BAM;

RemoteBAM.prototype.getTier = function(style) {
    // Determine if this file needs to be accessed via SSH.
    var re_ssh = /^\w+@.+:.+$/; 
    var match  = re_ssh.exec(this.file);
    if (match) {
        this.tier["samURI"] = window.location.origin + '/' + this.file;
        this.tier["tier_type"] = 'samserver';
    } else {
        this.tier["bamURI"] = this.file;
        this.tier["credentials"] = true;

    }
    this.tier["padding"] = 0;
    this.tier["name"] = app.settings.serverLocation + this.name;
    this.tier["style"] = style;
    this.tier["scaleVertical"] = true;
    return this.tier;
}

function LocalBAI(file, id) {
    this.base = BAI;
    this.base(file, file.name, id);
}

LocalBAI.prototype = new BAI;

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

module.exports = {
    RemoteBAM: RemoteBAM,
    RemoteBAI: RemoteBAI,
    LocalBAM: LocalBAM,
    LocalBAI: LocalBAI
};