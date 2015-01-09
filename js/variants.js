"use strict";

function VariantLocations() {
    this.variantArray = [];
    this.current = 0;
    this.fileName = "";
}

VariantLocations.prototype.updateByList = function() {
    var selected = document.getElementById("mySelect");
    console.log(selected);
    this.current = parseInt(selected.value);
    this.gotoCurrentVariant();
};

VariantLocations.prototype.setQC = function(decision) {
    this.variantArray[this.current].score = decision;
    this.refreshSelectList();
    this.refreshProgressBar();
    return this.next();
};

VariantLocations.prototype.getProgress = function() {
    var progress = 0;
    for (var i=0; i<this.variantArray.length; i++) {
        if(this.variantArray[i].score > -99) {
            progress++;
        }
    }
    return progress;
} 

VariantLocations.prototype.refreshProgressBar = function() {
    var progress = this.getProgress();
    var percent = "" + (100*progress/this.variantArray.length)|0;
    var progressBar = document.getElementById("variantProgress");
    progressBar.setAttribute("aria-valuenow", percent);
    progressBar.style.width = percent + "%";
};

VariantLocations.prototype.init = function(fileText, fileName) {
    this.processVariantFile(fileText, fileName);
    this.gotoCurrentVariant();
    this.refreshSelectList();
}

VariantLocations.prototype.processVariantFile = function(fileText, fileName) {
    this.fileName = fileName; 
    var textArray = fileText.split("\n");
    var pattern = /\s*[-:,\s]+\s*/;
    for (var i = 0; i < textArray.length; i++) {
        var variant = textArray[i].trim();
        var parts = variant.split(pattern);
		
		switch (parts) {
			case 2: // SNP
	        var chr = parseInt(parts[0]);
	        var loc = parseInt(parts[1]);
			var v = new SNP(chr, loc);
            this.variantArray.push(v);
			break;
		case 3: // CNV
	        var chr = parseInt(parts[0]);
	        var start = parseInt(parts[1]);
	        var end = parseInt(parts[2]);
			var v = new CNV(chr, start, end);
            this.variantArray.push();	
			break;
		default:
			console.log("Unrecognized variant");
		}
	}
}


VariantLocations.prototype.generateQCreport = function() {
    // parts of this will be moved to session.js
    var out = $("#QCreportFilename").val();
    var str = Date() + "\n\n";
    
    for (var i = 0; i < b.tiers.length; i++) {
        if (b.tiers[i].featureSource.source) {
           var bamName = b.tiers[i].featureSource.source.bamSource.name;
            str += bamName + "\n";
        }
    }
  
    str += "\n" + this.fileName + "\n\n";

    for (var i = 0; i < this.variantArray.length; i++) {
        var v = this.variantArray[i];
        str += v.string() + "\n"; 
    }

    var blob = new Blob([str], {type: "text/plain;charset=utf-8"});
    saveAs(blob, out); 
}

VariantLocations.prototype.refreshSelectList = function() {
	console.log('things have changed');
    var stringArray = this.getStringArray();
    var selectList = document.getElementById("mySelect"); 
    selectList.innerHTML = "";

    //Create and append the options
    for (var i = 0; i < stringArray.length; i++) {
        var option = document.createElement("option");
        option.value = i;
        option.innerHTML = stringArray[i];
        selectList.appendChild(option);
    }
};

function formatLongInt(n) {
    return (n|0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

VariantLocations.prototype.getStringArray = function() {
    var stringArray = Array(this.variantArray.length);
    for (var i = 0; i<this.variantArray.length; i++) {
        stringArray[i] = this.variantArray[i].prettyString();
    }
    return stringArray;
};

VariantLocations.prototype.gotoCurrentVariant = function() {
    console.log(this.current);
    var c = this.variantArray[this.current];
    console.log(c);
	c.visit()
    if (settings.autoZoom) {
        if (settings.defaultZoomLevelUnit) { 
            b.zoomStep(-1000000);
        } else {
            b.zoom(settings.currentZoom);
        }
    }
    document.getElementById("mySelect").value = this.current;
};

VariantLocations.prototype.next = function() {
    console.log("this.current =  " + this.current);
    console.log("this.variantArray.length =  " + this.variantArray.length);
    if ((this.current + 1) < this.variantArray.length) {
        console.log("I'm moving on");
        this.current++;
        this.gotoCurrentVariant();
        return true;
    } else { // at the end now
        console.log("I'm not moving");
        document.getElementById("mySelect").value = this.current;
        //generateQCreport();
        return false;
    }
};

VariantLocations.prototype.prev = function() {
    if (this.current > 0) {
        this.current--;
        this.gotoCurrentVariant();
    }
};

