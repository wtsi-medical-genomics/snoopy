"use strict";

var variants = require('./variant.js');
var SNP = variants.SNP;
var CNV = variants.CNV;
var utils = require('./utils.js');
var getExtension = utils.getExtension;
var styleSheets = require('./styles.js');
var loadedfiletypes = require('./loadedfiletypes.js');
var RemoteBAM = loadedfiletypes.RemoteBAM;
var RemoteBAI = loadedfiletypes.RemoteBAI;
var LocalBAM = loadedfiletypes.LocalBAM;
var LocalBAI = loadedfiletypes.LocalBAI;

var BAI_RE = /^(.*)\.bai$/i;
var BAM_RE = /^(.*)\.bam$/i;


var referenceGenome = {
    name: 'Genome',
    twoBitURI: 'http://www.biodalliance.org/datasets/hg19.2bit',
    tier_type: 'sequence',
    provides_entrypoints: true,
    pinned: true
};

function Session(bamFiles, variantFile) {
   this.bamFiles = bamFiles || [];
   this.baiFiles = [];
   this.variantFile = variantFile || [];
   this.variants = [];
   this.index = 0;
   //this.ID = utils.getNextUID();
};

Session.prototype.addFile = function(file) {
    if (typeof(file) === 'string') {
        switch (getExtension(file)) {
            case "bam":
                var newBam = new RemoteBAM(file);
                this.bamFiles.push(newBam);
                break;
            case "bai":
                var newBai = new RemoteBAI(file);
                this.baiFiles.push(newBai);
                break;
        }
    } else {
        for (var i=0; i < file.length; ++i) {
            var f = file[i];
            switch (getExtension(f)) {
                case "bam":
                    var newBam = new LocalBAM(f);
                    this.bamFiles.push(newBam);
                    break;
                case "bai":
                    var newBai = new LocalBAI(f);
                    this.baiFiles.push(newBai);
                    break;
            }
        }
    }
    this.matchMaker();
    console.log(this);
};

/** Determines if any unmatched LocalBAM's have a matching LocalBAI. It is not necessary for
a RemoteBAM to have a RemoteBAI, as it assumed to be in the same location, but if any RemoteBAI's 
have been provided marry these to a RemoteBAM.*/
Session.prototype.matchMaker = function() {
    var toRemove = [];
    for (var i=0; i<this.bamFiles.length; ++i) {
        var bamFile = this.bamFiles[i];
        if (!bamFile.index) {
            for (var j=0; j<this.baiFiles.length; ++j) {
                var baiFile = this.baiFiles[j];
                var stripBai = baiFile.name.match(BAI_RE);
                var stripBam = bamFile.name.match(BAM_RE);
                if ((stripBai[1] === bamFile.name) || (stripBai[1] === stripBam[1]) &&
                    (bamFile.file.type === baiFile.file.type)) {
                    this.bamFiles[i].index = baiFile;
                    toRemove.push(baiFile.id);
                }
            }
        }
    }
    toRemove.forEach((id) => {this.remove(id)});
};

Session.prototype.remove = function(id) {
    this.bamFiles = this.bamFiles.filter(function(bamFile) {
        return bamFile.id !== id;
    })
    this.baiFiles = this.baiFiles.filter(function(baiFile) {
        return baiFile.id !== id;
    })
};

Session.prototype.setQC = function(decision) {
    this.variants[this.index].score = decision;
};


Session.prototype.next = function(b) {
    if (this.index < this.variants.length - 1) {
        return this.variants[++this.index].visit(b);
    } else { // at the end now
        return false;
    }
};

Session.prototype.gotoCurrentVariant = function(b) {
    this.variants[this.index].visit(b);
    return this.variants[this.index];
};

Session.prototype.getCurrentVariant = function() {
    return this.variants[this.index];
};

Session.prototype.previous = function(b) {
    if (this.index > 0) {
        this.index--;
        return this.gotoCurrentVariant(b);
        // return this.getCurrentVariant();
    } else {
        return false;
    }
}

Session.prototype.parseVariants = function(variants) {
    // the variants have not been loaded so process the contents of the variant file text
    this.variants = [];

    if (typeof(variants) == 'string') {
        variants = variants.trim();
        variants = variants.split("\n");
    }
    var pattern = /\s*[-:,\s]+\s*/;
    for (var i = 0; i < variants.length; i++) {
        var variant = variants[i].trim();
        var parts = variant.split(pattern);
        var chr = parts[0];
            switch (parts.length) {
                case 2: // SNP
                    var loc = parseInt(parts[1]);
                    var v = new SNP(chr, loc);
                    break;
                case 3: // CNV
                    var start = parseInt(parts[1]);
                    var end = parseInt(parts[2]);
                    var v = new CNV(chr, start, end);
                    break;
                default:
                    console.log("Unrecognized variant");
                    console.log(variant);
            }
            this.variants.push(v);
    }
};

Session.prototype.init = function(b) {
    b.removeAllTiers();
    //this.browser.baseColors = app.settings.colors;
    b.addTier(referenceGenome);
    var style = styleSheets['raw'].styles;
    this.bamFiles.forEach((bamFile) => {
        b.addTier(bamFile.getTier(style));
    });

    // for (var i=0; i < this.bamFiles.length; ++i) {
    //     var style = styleSheets['raw'].styles;
    //     var bamTier = this.bamFiles[i].getTier(style);
    //     // if (app.settings.dallianceView === 'condensed')
    //     //     bamTier.padding = 0;
    //     // if (bamTier) { 
    //     //     app.browser.addTier(bamTier);
    //     // } 
    //     b.addTier(bamTier);
    // }
    //app.browser.refresh();
}

function Sessions() {
    this.sessions = [];
    this.index = 0;
};

Sessions.prototype.next = function(b) {
    var nextVariant = this.sessions[this.index].next(b);
    if (!nextVariant) {
        if (this.index < this.sessions.length - 1) {
            this.sessions[++this.index].init(b);
            nextVariant = this.gotoCurrentVariant(b);
        } else {
            console.log('finished QC');
        }
    }
    return nextVariant;
};

Sessions.prototype.previous = function(b) {
    var previousVariant = this.sessions[this.index].previous(b);
    if (!previousVariant) {
        if (this.index > 0) {
            this.index--;
            this.sessions[this.index].init(b);
            // Need to visit the last element of the previous session
            this.sessions[this.index].index = this.sessions[this.index].variants.length - 1;
            previousVariant = this.gotoCurrentVariant(b);
        } else {
            console.log('at the beginning');
        }
    }
    return previousVariant;
};

Sessions.prototype.setQC = function(decision) {
    this.sessions[this.index].setQC(decision);
};

Sessions.prototype.gotoCurrentVariant = function(b) {
    this.sessions[this.index].gotoCurrentVariant(b);
};

Sessions.prototype.getCurrentVariant = function() {
    return this.sessions[this.index].getCurrentVariant();
};

/** Add tiers and visit the very first session/variant */
Sessions.prototype.init = function(b) {
    this.sessions[this.index].init(b)
};

module.exports = {
    Sessions: Sessions,
    Session: Session,
}