"use strict";

var utils = require('./utils.js');
var getName = utils.getName;
var httpGet = utils.httpGet;
var UID = utils.UID;

var Map = require('immutable').Map;

var uid = new UID();
var BAI_RE = /^(.*)\.bai$/i;

// function createLoadedFileObject(file, connection) {
//   if (typeof(file) === 'string') { // a URL
//     switch (getExtension(file)) {
//       case "bam":
//       case "cram":
//         switch (connection.get('type')) {
//           case 'HTTP':
//             var requiresCredentials = connection.get('requiresCredentials') || false;
//             return new RemoteBAM(file, requiresCredentials);
//           case 'SSHBridge':
//             return new SSHBAM(file);
//         }
//         break;
//       case "bai":
//         return new RemoteBAI(file);
//     }
//   } else { // a file object
//     var f = file[0];
//     switch (getExtension(f)) {
//       case "bam":
//         return new LocalBAM(f);
//       case "bai":
//         return new LocalBAI(f);
//     }
//   }
// }


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

 BAM.prototype = new LoadedFile;


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
};

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
};

function RemoteBAI(file) {
    this.base = BAI;
    this.base(file, getName(file), true);
}

RemoteBAI.prototype = new BAI;

function RemoteBAM(file, requiresCredentials) {
    this.base = BAM;
    this.base(file, getName(file));
    this.index = true;
    this.requiresCredentials = requiresCredentials || false;
}

RemoteBAM.prototype = new BAM;

RemoteBAM.prototype.getTier = function(style) {
    this.tier["bamURI"] = this.file;
    this.tier["credentials"] = this.requiresCredentials;
    this.tier["padding"] = 0;
    this.tier["name"] = this.name;
    this.tier["style"] = style;
    this.tier["scaleVertical"] = true;
    return this.tier;
};

RemoteBAM.prototype.exists = function() {
  // return new Promise((resolve, reject) => {
    var path = this.file;
    var connection = Map({requiresCredentials: this.requiresCredentials});
    var opts = {range: {min: 0, max:1}};
    return httpGet(path, connection, opts);
}

function SSHBAM(file) {
    this.base = BAM;
    this.base(file, getName(file));
    this.index = true;
}

SSHBAM.prototype = new BAM;

SSHBAM.prototype.getTier = function(style) {
    this.tier["samURI"] = this.file;
    this.tier["tier_type"] = 'samserver';
    this.tier["padding"] = 0;
    this.tier["name"] = this.name;
    this.tier["style"] = style;
    this.tier["scaleVertical"] = true;
    return this.tier;
};

SSHBAM.prototype.exists = function() {
  // Need to add to the path url for chr1, 0-1
  var path = this.file + '&lchr=1&lmin=1&lmax=2';
  // var connection = Map({requiresCredentials: this.requiresCredentials});
  // var opts = {range: {min: 0, max:1}};
  return httpGet(path, null);
}

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
};

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
};

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
};

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

function SSHFile(connection) {
    //unpack connection elements here
    //create a get tier
}



SSHFile.prototype = new LoadedFile;




module.exports = {
    RemoteBAM: RemoteBAM,
    SSHBAM: SSHBAM,
    RemoteBAI: RemoteBAI,
    LocalBAM: LocalBAM,
    LocalBAI: LocalBAI
};