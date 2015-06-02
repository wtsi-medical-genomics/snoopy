function Variant(chr) {
	this.chr = chr;
	this.score = 'not reviewed';
    this.colorCode = {
        'variant': 'limegreen',
        'not variant': 'darkred',
        'uncertain': 'orange'
    }
}

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

SNP.prototype.visit = function() {
    app.browser.clearHighlights();
    app.browser.setCenterLocation('chr' + this.chr, this.loc);
    app.browser.highlightRegion('chr' + this.chr, this.loc, this.loc + 1);
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
	return this.chr + ":" + this.loc + " " + this.score;
}

CNV.prototype = new Variant;

function CNV(chr, start, end) {
	this.base = Variant;
	this.base(chr);
	this.start = start;
	this.end = end;
}

CNV.prototype.visit = function() {
    app.browser.clearHighlights();
	var loc = (this.start + this.end) / 2;
    app.browser.setCenterLocation('chr' + this.chr, loc);
    app.browser.highlightRegion('chr' + this.chr, this.start, this.end);
}

CNV.prototype.prettyString = function() {
	return this.chr + ":" + this.start + "-" + this.end + " "+ this.scoreString();
}

CNV.prototype.string = function() {
	return this.chr + ":" + this.start + "-" + this.end + " " + this.score;
}

module.exports = {
    SNP: SNP,
    CNV: CNV
};