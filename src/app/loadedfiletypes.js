"use strict";


var utils = require('./utils.js');
var getName = utils.getName;
var UID = utils.UID;

var uid = new UID();
var BAI_RE = /^(.*)\.bai$/i;

function LoadedFile(file, name) {
    this.file = file || null;
    this.name = name || null;
    this.id = uid.next();
}

function BAM(file, name, index) {
    this.base = LoadedFile;
    this.base(file, name);
    this.index = index || null;
    this.tier = {
       noPersist: true,
       subtierMax: 1000
    };
 }


function BAI(file, name, mapping) {
    this.base = LoadedFile;
    this.base(file, name);
    this.mapping = mapping || null;
 }


function LocalBAM(file) {
    this.base = BAM;
    this.base(file, file.name);
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

/** Determine if bai is a suitable index based on filename */
// BAM.prototype.matchesIndex = function(bai) {
//     var m = bai.name.match(BAI_RE);
//     return (m[1] === this.name);
// }

LocalBAM.prototype.getTier = function(style) {
    this.tier["bamBlob"] = this.file;
    this.tier["baiBlob"] = this.index.file;
    this.tier["name"] = this.name;
    this.tier["style"] = style;
    this.tier["padding"] = 0;
    this.tier["scaleVertical"] = true;
    return this.tier;
}

function RemoteBAI(file) {
    this.base = BAI;
    this.base(file, getName(file), true);
}

RemoteBAI.prototype = new BAI;

function RemoteBAM(file) {
    this.base = BAM;
    this.base(file, getName(file));
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

// SSHBAM.prototype = new RemoteBAM;

// function SSHBAM(file) {
//     this.base = BAM;
//     this.base(file, getName(file));
//     this.index = true;
// }



function LocalBAI(file) {
    this.base = BAI;
    this.base(file, file.name);
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

module.exports = {
    RemoteBAM: RemoteBAM,
    RemoteBAI: RemoteBAI,
    LocalBAM: LocalBAM,
    LocalBAI: LocalBAI
};