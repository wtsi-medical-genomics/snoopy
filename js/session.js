"use strict";

function Session(bamFiles, variantFile) {
   this.bamFiles = bamFiles || null;
   this.variantFile = variantFile || null;
   this.variantArray = [];
   this.current = 0;
}

Session.prototype.init = function(fileText, fileName) {
    this.processVariantFile(fileText, fileName);
    this.gotoCurrentVariant();
    this.refreshSelectList();
};

Session.prototype.load = function(variantText, dallianceBrowser) {

    // process the contents of the variant file text
    var textArray = variantText.split("\n");
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

    // setup the variant file drop down
    for (var i=0; i < this.bamFiles.length; ++i) {
        var bamTier = this.bamFiles[i].getTier();
        if (bamTier) { 
            console.log(bamTier);
            dallianceBrowser.addTier(bamTier);
        } 
    }
    
    this.gotoCurrentVariant();
    this.refreshSelectList();
};

Session.prototype.updateByList = function() {
    var selected = document.getElementById("mySelect");
    console.log(selected);
    this.current = parseInt(selected.value);
    this.gotoCurrentVariant();
};

Session.prototype.setQC = function(decision) {
    this.variantArray[this.current][2] = decision;
    this.refreshSelectList();
    this.refreshProgressBar();
    return this.next();
};

Session.prototype.getProgress = function() {
    var progress = 0;
    for (var i=0; i<this.variantArray.length; i++) {
        if(this.variantArray[i][2] > -99) {
            progress++;
        }
    }
    return progress;
};

Session.prototype.refreshProgressBar = function() {
    var progress = this.getProgress();
    var percent = "" + (100*progress/this.variantArray.length)|0;
    var progressBar = document.getElementById("variantProgress");
    progressBar.setAttribute("aria-valuenow", percent);
    progressBar.style.width = percent + "%";
};

Session.prototype.generateQCreport = function() {
    // parts of this will be moved to session.js
    var out = $("#QCreportFilename").val();
    var str = Date() + "\n\n";
    
    for (var i = 0; i < b.tiers.length; i++) {
        if (b.tiers[i].featureSource.source) {
           var bamName = b.tiers[i].featureSource.source.bamSource.name;
            str += bamName + "\n";
        }
    }
  
    str += "\n" + this.fileName + "\n";
    str += "\n";

    for (var i = 0; i < this.variantArray.length; i++) {
        var v = this.variantArray[i];
        str += v[0] + ":" +  v[1] + " " + v[2] + "\n"; 
    }

    var blob = new Blob([str], {type: "text/plain;charset=utf-8"});
    saveAs(blob, out); 
};

Session.prototype.refreshSelectList = function() {

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
};

Session.prototype.getStringArray = function() {
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

Session.prototype.gotoCurrentVariant = function() {
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

Session.prototype.next = function() {
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

Session.prototype.prev = function() {
    if (this.current > 0) {
        this.current--;
        this.gotoCurrentVariant();
    }
};

function Sessions() {
    this.sessions = [];
    this.current = null;
}

Sessions.prototype.load = function(dallianceBrowser) {
    this.sessions[0].variantFile.get(this.sessions[0], dallianceBrowser);
    this.current = 0;
}

Sessions.prototype.getLength = function() {
    return this.sessions.length;
}   

Sessions.prototype.addSession = function(session) {
    this.sessions.push(session);
}

Sessions.prototype.setQC = function(decision) {
    if(!this.sessions[this.current].setQC(decision)) {
        var progress = v.getProgress(); 
        var total = v.variantArray.length;
        var message = "You have reviewed ";
        message += "<b>" + progress + "</b>";
        message += " of ";
        message += "<b>" + total + "</b>";
        message += " variant locations. Enter desired filename for quality control report.";
            message += "<div class=\"input-group\"><input type=\"text\" class=\"form-control\" id=\"QCreportFilename\"><span class=\"input-group-addon\">.txt</span> </div>";
        $("#modalDownloadQCreport .modal-body").html(message);
        $("#modalDownloadQCreport").modal('show');
        $('#modalConfirmNextSet').modal('show');
        console.log('zzz');
    }
}

Sessions.prototype.prev = function() {
    this.sessions[this.current].prev();
}

Sessions.prototype.gotoCurrentVariant = function() {
    this.sessions[this.current].gotoCurrentVariant();
}

Sessions.prototype.updateByList = function() {
    this.sessions[this.current].updateByList();
}

 
