"use strict";

var variants = require('./variant.js');
var SNP = variants.SNP;
var CNV = variants.CNV;
var utils = require('./utils.js');
var getExtension = utils.getExtension;
var httpGet = utils.httpGet;
var styleSheets = require('./styles.js');
var loadedfiletypes = require('./loadedfiletypes.js');
var RemoteBAM = loadedfiletypes.RemoteBAM;
var RemoteBAI = loadedfiletypes.RemoteBAI;
var SSHBAM = loadedfiletypes.SSHBAM;
var LocalBAM = loadedfiletypes.LocalBAM;
var LocalBAI = loadedfiletypes.LocalBAI;
var Settings = require('./components/settings.jsx');
var getPrefix = Settings.getPath;

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
}

Session.prototype.addVariants = function(variants, connection) {
  var re_dna_location = /[chr]*[0-9,m,x,y]+[-:,\s]+\w+/i;
  switch (typeof(variants)) {
    case 'string':
      if (variants.match(re_dna_location)) {
        // A single dna location
        this.parseVariants(variants);
      } else {
        // A path to a file at a remote location
        httpGet(variants, connection).then((response) => {
          console.log(response);
          this.parseVariants(response);
        }).catch((error) => {
          console.log('Failed!', error);
          throw error;
        });
      }
      break;
    case 'object':
      // An array of single dna locations
      this.parseVariants(variants);
      break;
    default:
      throw 'Unrecognized type for: ' + variants;
  }
};

Session.prototype.generateQCreport = function() {    
  var str = "\n\nVariant File\n" + this.variantFile.name;
  str += "\n\nBAM Files\n";
  for (var i = 0; i < this.bamFiles.length; i++) {
    str += this.bamFiles[i].name + "\n";
  }
  str += "\n";
  for (var i = 0; i < this.variants.length; i++) {
    str += this.variants[i].string() + "\n"; 
  }
  return str;
};



Session.prototype.addBam = function(file, connection) {
  if (typeof(file) === 'string') { // a URL
    switch (getExtension(file)) {
      case "bam":
      case "cram":
        switch (connection.get('type')) {
          case 'HTTP':
            var requiresCredentials = connection.get('requiresCredentials') || false;
            var newBam = new RemoteBAM(file, requiresCredentials);
            break;
          case 'SSHBridge':
            var newBam = new SSHBAM(file);
            break;
        }
        this.bamFiles.push(newBam);
        break;
      case "bai":
        var newBai = new RemoteBAI(file);
        this.baiFiles.push(newBai);
        break;
    }
  } else { // a file object
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
    return {variant: this.variants[++this.index].visit(b), done: false};
  } else { // at the end now
    return {variant: this.variants[this.index].visit(b), done: true};
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

Session.prototype.getNumVariantsReviewed = function() {
  var reviewed = this.variants.filter((variant) => {
     return variant.score !== 'not reviewed';
  });
  return reviewed.length;
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
          throw 'Unrecognized variant: ' + variant;
      }
      this.variants.push(v);
  }
};

Session.prototype.init = function(b, style) {
  b.removeAllTiers();
  //this.browser.baseColors = app.settings.colors;
  b.addTier(referenceGenome);
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!werhjaljfklasjdfkljasdklf;jadkls');
  console.log(style);
  this.bamFiles.forEach((bamFile) => {
    // var style = styleSheets['raw'].style;
    b.addTier(bamFile.getTier(style.toJS()));
  });
  this.index = 0;

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
  // b.refresh();
}

Session.prototype.goto = function(b, style, vi) {
  b.removeAllTiers();
  //this.browser.baseColors = app.settings.colors;
  b.addTier(referenceGenome);
  this.bamFiles.forEach((bamFile) => {
    b.addTier(bamFile.getTier(style.toJS()));
  });
  this.index = vi;
  return this.gotoCurrentVariant(b);
};

Session.prototype.getCurrentVariantIndex = function() {
  return this.index;
};

function Sessions() {
  this.sessions = [];
  this.index = 0;
};

Sessions.prototype.next = function(b) {
  var nextVariant = this.sessions[this.index].next(b);
  if (nextVariant.done) {
    if (this.index < this.sessions.length - 1) {

      console.log('???????????????sdgfasdfsdafasdf?????');
      console.log(this.style);
      this.sessions[++this.index].init(b, this.style);
      nextVariant = {variant: this.gotoCurrentVariant(b), done: false};
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
      this.sessions[this.index].init(b, this.style);
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
  return this.sessions[this.index].gotoCurrentVariant(b);
};

Sessions.prototype.getCurrentVariant = function() {
  return this.sessions[this.index].getCurrentVariant();
};

Sessions.prototype.goto = function(b, si, vi) {
  if (this.index !== si) {
    this.index = si;
    return this.sessions[si].goto(b, this.style, vi);
  } else {
    this.sessions[this.index].index = vi;
    return this.gotoCurrentVariant(b);
  }
};

/** Add tiers and visit the very first session/variant */
// Sessions.prototype.jump = function(b) {
//     if (typeof(this.style) === 'undefined')
//         throw "A style sheet has not been set.";
//     this.sessions[this.index].init(b, style);
// };

/** Add tiers and visit the very first session/variant */
Sessions.prototype.init = function(b, style) {
  if (typeof(style) !== 'undefined')
    this.style = style;
  if (typeof(this.style) === 'undefined')
    throw "A style sheet has not been set.";
  this.sessions[this.index].init(b, this.style);
};

Sessions.prototype.getCurrentVariantIndex = function() {
  return this.sessions[this.index].getCurrentVariantIndex();
};

Sessions.prototype.getCurrentSessionIndex = function() {
  return this.index;
};

Session.prototype.stringCurrentSession = function() {
  var str = ''
  this.bamFiles.forEach((bam) => {str += bam.name + '_'});
  str += this.variants[this.index].fileString()
  return str;
}


Sessions.prototype.stringCurrentSession = function() {
  return this.sessions[this.index].stringCurrentSession();
}


Sessions.prototype.generateQCreport = function() {
    var str = Date();    
    this.sessions.forEach((session) => {
      str += session.generateQCreport();
    });
    return str;
};

Sessions.prototype.updateStyle = function(b, style) {
  this.style = style;
  this.sessions[this.index].updateStyle(b, style);
}

Session.prototype.updateStyle = function(b, style) {
  // get styles and update each tier
  // app.browser.baseColors = app.settings.colors;
  for (var i=1; i<b.tiers.length; ++i) {
    b.tiers[i].setStylesheet(style.toJS());
  }
  b.refresh();
}

Sessions.prototype.getNumVariants = function() {
  var n = 0;
  this.sessions.forEach((session) => {
    n += session.variants.length;
  });
  return n;
}

Sessions.prototype.getNumVariantsReviewed = function() {
  var n = 0;
  this.sessions.forEach((session) => {
    n += session.getNumVariantsReviewed();
  });
  return n;
}

Sessions.prototype.getNumSessions = function() {
  return this.sessions.length;
}

module.exports = {
  Sessions: Sessions,
  Session: Session,
}