"use strict";

function variantLocations() {
    this.variantArray = [];
    this.current = 0;
}

variantLocations.prototype.updateByList = function() {
    var selected = document.getElementById("mySelect");
    console.log(selected);
    this.current = selected.value;
    this.gotoCurrentVariant();
}

variantLocations.prototype.setQC = function(decision) {
    this.variantArray[this.current][2] = decision;
    this.refreshSelectList();
    this.refreshProgressBar();
    v.next();
}

variantLocations.prototype.refreshProgressBar = function() {
    var progress = 0;
    for (var i=0; i<this.variantArray.length; i++) {
        if(this.variantArray[i][2] > -99) {
            progress++;
        }
    }
    var percent = "" + (100*progress/this.variantArray.length)|0;
    var progressBar = document.getElementById("variantProgress");
    progressBar.setAttribute("aria-valuenow", percent);
    progressBar.style.width = percent + "%";
}

variantLocations.prototype.processVariantFile = function(fileText) {
    var textArray = fileText.split("\n");
    var pattern = /\s*[-:,\s]+\s*/;
for (var i = 0; i < textArray.length; i++) {
    var variant = textArray[i].trim();
    var parts = variant.split(pattern);
    var chr = parseInt(parts[0]);
    var loc = parseInt(parts[1]); 
    if (parts.length === 2) {
        this.variantArray.push([chr, loc, -99]);
    }
}
};

variantLocations.prototype.refreshSelectList = function() {

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

variantLocations.prototype.getStringArray = function() {
    var stringArray = Array(this.variantArray.length);
    for (var i = 0; i<this.variantArray.length; i++) {
        var s = this.variantArray[i][0] + ":" + this.variantArray[i][1];
        switch (this.variantArray[i][2]) {
            case -1:
                s += " &#x2717;";
            break;
            case 0:
                s += " ?";
            break;
            case 1:
                s += " &#x2713;";
            break;
        }
        stringArray[i] = s;
    }
    return stringArray;
};

variantLocations.prototype.gotoCurrentVariant = function() {
    console.log(this.current);
    console.log(this.variantArray); 
    var c = this.variantArray[this.current];
    document.getElementById("currentVariant").innerHTML = String(c[0]) + " : " + String(c[1]);
    b.setLocation("chr" + c[0], c[1] - 55, c[1] + 55);
    b.zoomStep(-1000000);
    document.getElementById("mySelect").value = this.current;
};

variantLocations.prototype.next = function() {
    if (this.current < this.variantArray.length - 1) {
        this.current++;
        this.gotoCurrentVariant();
    }
};

variantLocations.prototype.prev = function() {
    if (this.current > 0) {
        this.current--;
        this.gotoCurrentVariant();
    }
};


