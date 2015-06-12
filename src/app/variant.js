"use strict";

function Variant(chr) {
	this.chr = chr;
	this.score = 'not reviewed';
    this.colorCode = {
        'variant': 'limegreen',
        'not variant': 'darkred',
        'uncertain': 'orange'
    }
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

SNP.prototype = new Variant;

function SNP(chr, loc) {
	this.base = Variant;
	this.base(chr);
	this.loc = loc;
}

SNP.prototype.visit = function(b) {
    b.clearHighlights();
    b.setCenterLocation('chr' + this.chr, this.loc);
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

SNP.prototype.prettyString = function() {
	return this.chr + ":" + this.loc + " " + this.scoreString();
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

CNV.prototype = new Variant;

function CNV(chr, min, max) {
	this.base = Variant;
	this.base(chr);
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

CNV.prototype.prettyString = function() {
	return this.chr + ":" + this.min + "-" + this.max + " "+ this.scoreString();
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

module.exports = {
    SNP: SNP,
    CNV: CNV
};