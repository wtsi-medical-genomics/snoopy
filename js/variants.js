"use strict";

variantLocations.prototype.setQC = function() {
    console.log("setQC");
    var decision = $("#qcDecision input:radio:checked").val();
    if (decision !== undefined) {
        this.variantArray[this.current][2] = parseInt(decision);
        $("#qcDecision input:radio:checked").prop("checked", false);
        $("#qcDecision label").removeClass("active");
        this.refreshSelectList();
    }
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
        option.text = stringArray[i];
        selectList.appendChild(option);
    }
};

variantLocations.prototype.getStringArray = function() {
    var stringArray = Array(this.variantArray.length);
    for (var i = 0; i<this.variantArray.length; i++) {
        var s = this.variantArray[i][0] + ":" + this.variantArray[i][1];
        switch (this.variantArray[i][2]) {
            case -1:
                s += " - not a variant";
            break;
            case 0:
                s += " - maybe a variant";
            break;
            case 1:
                s += " - variant";
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
    this.setQC();
    if (this.current < this.variantArray.length - 1) {
        this.current++;
        this.gotoCurrentVariant();
    }
};

variantLocations.prototype.prev = function() {
    this.setQC();
    if (this.current > 0) {
        this.current--;
        this.gotoCurrentVariant();

    }
};


