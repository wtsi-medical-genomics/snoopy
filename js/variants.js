"use strict";

function variantLocations() {
    this.variantArray = [];
    this.current = 0;
    this.fileName = "";
}

variantLocations.prototype.updateByList = function() {
    var selected = document.getElementById("mySelect");
    console.log(selected);
    this.current = parseInt(selected.value);
    this.gotoCurrentVariant();
};

variantLocations.prototype.setQC = function(decision) {
    this.variantArray[this.current][2] = decision;
    this.refreshSelectList();
    this.refreshProgressBar();
    this.next();
};

variantLocations.prototype.getProgress = function() {
    var progress = 0;
    for (var i=0; i<this.variantArray.length; i++) {
        if(this.variantArray[i][2] > -99) {
            progress++;
        }
    }
    return progress;
} 

variantLocations.prototype.refreshProgressBar = function() {
    var progress = this.getProgress();
    var percent = "" + (100*progress/this.variantArray.length)|0;
    var progressBar = document.getElementById("variantProgress");
    progressBar.setAttribute("aria-valuenow", percent);
    progressBar.style.width = percent + "%";
};

variantLocations.prototype.init = function(f, variant_instance) {
    if (f instanceof RemoteVariantList) {
        $.ajax({
            url: "https://web-lustre-01.internal.sanger.ac.uk/" + f.file,
                xhrFields: { withCredentials: true }
        }).done(function(fileText) {
            console.log(fileText);
            variant_instance.init2(fileText, f.name);
        });
    } else {
        var reader = new FileReader();
        reader.readAsText(f.file);
        reader.onload = function() {
            variant_instance.init2(reader.result, f.name);
       }
    }
};

variantLocations.prototype.init2 = function(fileText, fileName) {
    this.processVariantFile(fileText, fileName);
    this.gotoCurrentVariant();
    this.refreshSelectList();
}

variantLocations.prototype.processVariantFile = function(fileText, fileName) {
    this.fileName = fileName; 
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

variantLocations.prototype.generateQCreport = function() {
    var out = $("#QCreportFilename").val();
    var str = Date() + "\n\n";
    
    for (var i = 0; i < b.tiers.length; i++) {
        if (b.tiers[i].featureSource.source) {
           var bamName = b.tiers[i].featureSource.source.bamSource.name;
            str += bamName + "\n";
    //        fname += bamName + "_";
        }
    }
  
    str += "\n" + this.fileName + "\n"; 
    str += "\n"; 

    for (var i = 0; i < this.variantArray.length; i++) {
        var v = this.variantArray[i];
        console.log(v);
        str += v[0] + ":" +  v[1] + " " + v[2] + "\n"; 
    }

    var blob = new Blob([str], {type: "text/plain;charset=utf-8"});
    saveAs(blob, out); 
}

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

function formatLongInt(n) {
    return (n|0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

variantLocations.prototype.getStringArray = function() {
    var stringArray = Array(this.variantArray.length);
    for (var i = 0; i<this.variantArray.length; i++) {
        var s = this.variantArray[i][0] + ":" + formatLongInt(this.variantArray[i][1]);
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
    var c = this.variantArray[this.current];
    console.log(c);
    b.setCenterLocation('chr' + c[0], c[1]);
    b.clearHighlights();
    b.highlightRegion('chr' + c[0], c[1], c[1] + 1);
    if (settings.autoZoom) {
        if (settings.defaultZoomLevelUnit) { 
            b.zoomStep(-1000000);
        } else {
            b.zoom(settings.currentZoom);
        }
    }
    document.getElementById("mySelect").value = this.current;
};

variantLocations.prototype.next = function() {
    console.log("this.current =  " + this.current);
    console.log("this.variantArray.length =  " + this.variantArray.length);
    if ((this.current + 1) < this.variantArray.length) {
        console.log("I'm moving on");
        this.current++;
        this.gotoCurrentVariant();
    } else { // at the end now
        console.log("I'm not moving");
        document.getElementById("mySelect").value = this.current;
        generateQCreport();
    }
};

variantLocations.prototype.prev = function() {
    if (this.current > 0) {
        this.current--;
        this.gotoCurrentVariant();
    }
};

