"use strict";

function Variant(chr, score='not reviewed', snapshotName=false) {
    this.chr = chr;
    this.score = score;
    this.colorCode = {
        'variant': 'limegreen',
        'not variant': 'darkred',
        'uncertain': 'orange'
    }
    this.snapshot = false;
    this.snapshotName = snapshotName;
}

// Variant.prototype.setScore(score) {
//     this.score = score;
// }

Variant.prototype.scoreString = function() {
    var s = "";
    switch (this.score) {
        case -1:
            s = " &#x2717;";
        break;
        case 0:
            s = " ?";
        break;
        case 1:
            s = " &#x2713;";
        break;
    }
    return s;
}

Variant.prototype.getScoreBadge = function() {
  switch (this.score) {
    case 'variant':
      return '<span class="badge pull-right green qc-badge">&#x2713;</span>';
    case 'uncertain':
      return '<span class="badge pull-right amber qc-badge">?</span>';
    case 'not variant':
      return '<span class="badge pull-right red qc-badge">x</span>';
    default:
      return '';
  }
}

Variant.prototype.takeSnapshot = function(browser, seqFiles) {
    let imgdata = browser.exportImage();
    imgdata = imgdata.split(',');
    if (imgdata.length === 2) {
        this.snapshot = imgdata[1];
        this.snapshotName = this.createSnapshotName(seqFiles);
    } else {
        console.log('more than two parts!!!!')
    }
}

Variant.prototype.createSnapshotName = function(seqFiles, maxLength=200) {
    let imgName = seqFiles.reduce((accum, f) => {
      if (accum.length === 0)
        return f.name;
      else
        return `${accum}_${f.name}`;
    }, '');
    imgName = imgName.slice(0, maxLength);
    return `${imgName}_${this.fileString()}.png`
}

Variant.prototype.getSnapshot = function() {
    return this.snapshot;
}

Variant.prototype.toObject = function() {
    var o = {chr: this.chr,
        location: this.getBasePosition(),
        qc_decision: this.score,
    };
    if (!!this.snapshot) {
        o['snapshot'] = this.snapshotName;
    }
    return o
}

SNP.prototype = new Variant;

function SNP(chr, loc, score='not reviewed', snapshotName=false) {
    this.base = Variant;
    this.base(chr, score, snapshotName);
    this.loc = parseInt(loc);
}

SNP.prototype.visit = function(b, callback) {
    b.clearHighlights();
    b.setCenterLocation('chr' + this.chr, this.loc, callback)
    // b.setCenterLocation('chr' + this.chr, this.loc, cb=>{
    //     console.log('This is a callback!');
    // });
    b.highlightRegion('chr' + this.chr, this.loc, this.loc + 1);
    return this;
}

SNP.prototype.getLocation = function() {
    return {chr: 'chr' + this.chr,
            loc: this.loc}
}

SNP.prototype.getHighlightRegion = function() {
    return {chr: 'chr' + this.chr,
            min: this.loc,
            max: this.loc + 1}
}

SNP.prototype.getHTML = function() {
    return `
        ${this.chr} : ${this.loc} ${this.getScoreBadge()}
    `;
}
 
SNP.prototype.html = function() {
    var html = this.chr + ':' + this.loc + ' ';
    if (this.score !== 'not reviewed')
         html += '<span class="badge" style="background-color:' + this.colorCode[this.score] + '">' + this.score + '</span>';
    return html;
}

SNP.prototype.string = function() {
    return this.chr + " : " + this.loc + " " + this.score;
}

SNP.prototype.fileString = function() {
    return this.chr + "_" + this.loc;
}

SNP.prototype.locationString = function() {
    return this.chr + " : " + this.loc;
}

SNP.prototype.getBasePosition = function() {
    return `${this.loc}`;
}

CNV.prototype = new Variant;

function CNV(chr, min, max, score='not reviewed', snapshotName=false) {
    this.base = Variant;
    this.base(chr, score, snapshotName);
    this.min = min;
    this.max = max;
}

CNV.prototype.visit = function(b) {
    b.clearHighlights();
    var loc = (this.min + this.max) / 2;
    b.setCenterLocation('chr' + this.chr, loc);
    b.highlightRegion('chr' + this.chr, this.min, this.max);
    return this;
}

CNV.prototype.getLocation = function() {
    var loc = (this.min + this.max) / 2;
    return {chr: 'chr' + this.chr,
            loc: this.loc}
}

CNV.prototype.getHighlightRegion = function() {
    return {chr: 'chr' + this.chr,
            min: this.min,
            max: this.max}
}

CNV.prototype.getHTML = function() {
    return `
        ${this.chr} : ${this.min} - ${this.max} ${this.getScoreBadge()}
    `;
}

CNV.prototype.string = function() {
    return this.chr + ":" + this.min + "-" + this.max + " " + this.score;
}

CNV.prototype.locationString = function() {
    return this.chr + ":" + this.min + "-" + this.max;
}

CNV.prototype.fileString = function() {
    return this.chr + "_" + this.min + "-" + this.max;
}

CNV.prototype.getBasePosition = function() {
    return `${this.min} - ${this.max}`;
}

module.exports = {
    SNP: SNP,
    CNV: CNV
};