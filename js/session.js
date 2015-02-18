"use strict";

function Session(bamFiles, variantFile) {
   this.bamFiles = bamFiles || [];
   this.variantFile = variantFile || [];
   this.variantArray = [];
   this.current = 0;
}

Session.prototype.init = function(fileText, fileName) {
    this.processVariantFile(fileText, fileName);
    this.gotoCurrentVariant();
    this.refreshVariantList();
};

Session.prototype.load = function(variantText) {
    // the variants have not been loaded so process the contents of the variant file text
    var textArray = variantText.split("\n");
    var pattern = /\s*[-:,\s]+\s*/;
    for (var i = 0; i < textArray.length; i++) {
        var variant = textArray[i].trim();
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
            }
            this.variantArray.push(v);
    }
    // setup the bam files 

    this.refreshStyles();
    this.gotoCurrentVariant();
    this.refreshVariantList();
};

Session.prototype.reload = function(variantIndex) {
    // // setup the bam files 
    // for (var i=0; i < this.bamFiles.length; ++i) {
    //     var bamTier = this.bamFiles[i].getTier();
    //     if (bamTier) { 
    //         console.log(bamTier);
    //         b.addTier(bamTier);
    //     }
    // }
    this.refreshStyles();
    this.gotoCurrentVariant();
    this.refreshVariantList();
};


Session.prototype.refreshStyles = function() {
    for (var i=0; i < this.bamFiles.length; ++i) {
        if (settings.defaultView === "coverage") 
            var style = baseCoverage['styles'];
        else
            var style = mismatch['styles'];
        var bamTier = this.bamFiles[i].getTier(style);
        if (bamTier) { 
            console.log(bamTier);
            b.addTier(bamTier);
        } 
    }
}

// Session.prototype.refreshStyles = function() {
//     // get styles and update each tier
//     if (displaySettings) {
//         for (var i=1; i<b.tiers.length; ++i) { 
//             if (displaySettings[0] === "mismatch" || settings.defaultDisplay === "mismatch") 
//                 b.tiers[i].setStylesheet(mismatch);
//             else 
//                 b.tiers[i].setStylesheet(baseCoverage);
//         }
//     }
//     b.refresh();
// }

Session.prototype.updateByVariantSelect= function() {
    var selected = document.getElementById("variantSelect");
    console.log(selected);
    this.current = parseInt(selected.value);
    this.gotoCurrentVariant();
};

Session.prototype.setQC = function(decision) {
    this.variantArray[this.current].score = decision;
    this.refreshVariantList();
    return this.next();
};

Session.prototype.print = function(backgroundColor) {
    var str = this.variantFile.print(null, false, backgroundColor);
    for (var i=0; i<this.bamFiles.length; i++) {
        str += this.bamFiles[i].print(null, false, backgroundColor);
    }
    return str;
}

Session.prototype.getProgress = function() {
    var progress = 0;
    for (var i=0; i<this.variantArray.length; i++) {
        if(this.variantArray[i].score > -99) {
            progress++;
        }
    }
    return progress;
};

Session.prototype.generateQCreport = function() {
    
    var str = "\n\nVariant File\n" + this.variantFile.name;
    str += "\n\nBAM Files\n";
    for (var i = 0; i < this.bamFiles.length; i++) {
            str += this.bamFiles[i].name + "\n";
    }
    str += "\n";
    for (var i = 0; i < this.variantArray.length; i++) {
        str += this.variantArray[i].string() + "\n"; 
    }
    return str;
};

Session.prototype.refreshVariantList = function() {

    var stringArray = this.getStringArray();
    var selectList = $("#variantSelect"); 

    selectList.empty() // get rid of any current variants
    console.log(selectList);
    //Create and append the options
    for (var i = 0; i < stringArray.length; i++) {
        selectList.append($("<option>").attr('value', i).html(stringArray[i]));
    }
    selectList.val(this.current);
    console.log(selectList);
};

function formatLongInt(n) {
    return (n|0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
};

Session.prototype.getStringArray = function() {
    var stringArray = Array(this.variantArray.length);
    for (var i = 0; i<this.variantArray.length; i++) {
        stringArray[i] = this.variantArray[i].prettyString();
    }
    return stringArray;
};

Session.prototype.gotoCurrentVariant = function() {
    console.log(this.current);
    var c = this.variantArray[this.current];
    console.log(c);
	c.visit();
    if (settings.autoZoom) {
        if (settings.defaultZoomLevelUnit) { 
            b.zoomStep(-1000000);
        } else {
            b.zoom(settings.currentZoom);
        }
    }
    document.getElementById("variantSelect").value = this.current;
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
        document.getElementById("variantSelect").value = this.current;
        return false;
    }
};

Session.prototype.prev = function() {
    if (this.current > 0) {
        this.current--;
        this.gotoCurrentVariant();
        return true;
    } else {
        return false;
    }
};

function Sessions() {
    this.sessions = [];
    this.current = null;
}

Sessions.prototype.load = function(sessionIndex, variantIndex) {
    // remove old tiers if there
    var conf = {index: 1};
    var nTiers = b.tiers.length;
    for (var i=1; i<nTiers; i++) {
        b.removeTier(conf);
    } 
    this.current = sessionIndex;
    if (this.sessions[this.current].variantArray.length > 0) {
        this.sessions[this.current].reload() // already seen the session 
    } else {
        this.sessions[sessionIndex].variantFile.get(this.sessions[sessionIndex], b);
    }
    this.refreshSelect();
}

Sessions.prototype.getLength = function() {
    var length = 0;
    for (var i=0; i<this.sessions.length; i++) {
        length += this.sessions[i].getLength();
    }
    return length;
}   

Sessions.prototype.addSession = function(session) {
    this.sessions.push(session);
}

Sessions.prototype.setQC = function(decision) {
    if (!this.sessions[this.current].setQC(decision)) {
        console.log('abracadrbra');
        if (this.current < this.sessions.length - 1) {
//            console.log('I still live');
//            var progress = this.sessions[this.current].getProgress(); 
//            var total = this.sessions[this.current].variantArray.length;
//            var message = "You have reviewed <b>" + progress + "</b> of <b>" + total + "</b> variant locations. Do you want to continue to the next set of variants?";
//            $('#modalConfirmNextSet .modal-body').html(message);
//            $('#modalConfirmNextSet').modal('show');
            this.load(this.current + 1);
        } else {
            this.promptQCdownload();
        }
    }
    this.refreshProgressBar();
}

Sessions.prototype.prev = function() {
    if (!this.sessions[this.current].prev()) {
        if (this.current > 0) {
           this.load(this.current - 1);
        }
    }
}

Sessions.prototype.gotoCurrentVariant = function() {
    this.sessions[this.current].gotoCurrentVariant();
}

Sessions.prototype.updateByVariantSelect= function() {
    this.getCurrent().updateByVariantSelect();
};

Sessions.prototype.updateBySessionSelect= function() {
    var s = $("#sessionSelect").val();
    this.load(s);
};

Sessions.prototype.getCurrent = function() {
    return this.sessions[this.current];
}; 

Sessions.prototype.downloadQCreport = function() {

    var str = Date();
    
    for (var i=0; i<this.sessions.length; i++) {
        str += this.sessions[i].generateQCreport();
    }
    
    var out = $("#QCreportFilename").val();
    var blob = new Blob([str], {type: "text/plain;charset=utf-8"});
    saveAs(blob, out);
};

Sessions.prototype.getNumberVariants = function() {
    var numVariants = 0;
    for (var i=0; i<this.sessions.length; i++) {
        numVariants += this.sessions[i].variantArray.length;
    }
    return numVariants;
};

Sessions.prototype.getProgress = function() {
    var progress = 0;
    for (var i=0; i<this.sessions.length; i++) {
        progress += this.sessions[i].getProgress();
    }
    return progress;
};

Sessions.prototype.promptQCdownload = function() {
    var progress = this.getProgress();
    var total = this.getNumberVariants();
    var message = "You have reviewed ";
    message += "<b>" + progress + "</b>";
    message += " of ";
    message += "<b>" + total + "</b>";
    message += " variant locations. ";
    message += "Enter desired filename for quality control report.";
    message += "<div class=\"input-group\"><input type=\"text\" class=\"form-control\" id=\"QCreportFilename\"><span class=\"input-group-addon\">.txt</span> </div>";
    $("#modalDownloadQCreport .modal-body").html(message);
    $("#modalDownloadQCreport").modal('show');
}

Sessions.prototype.print = function() {
    var str = ""; 
    var backgroundColor;
    for (var i=0; i<this.sessions.length; i++) {
        if (i%2 == 0) {
            backgroundColor = "#E8EFFF";  
        } else {
            backgroundColor = undefined; 
        }
        str += this.sessions[i].print(backgroundColor);
    }
    return str;
};

Sessions.prototype.refreshSelect = function() {
    if (this.sessions.length > 1) {
        var selectList = $("<select>").addClass("form-control").attr("id", "sessionSelect");
        selectList.on("change", $.proxy(function() {
            this.updateBySessionSelect();
        }, this));
        selectList.empty(); // get rid of any current variants
        for (var i = 0; i < this.sessions.length; i++) {
            selectList.append($("<option>").attr("value", i).html(this.sessions[i].variantFile.name));
        }
        selectList.val(this.current);
        $("#sessionSelectHolder").html(selectList);
    } else {
        var button = '<button type="button" class="btn btn-default" disabled="disabled">' + this.sessions[0].variantFile.name  + '</button>';
        $("#sessionSelectHolder").html(button);
    }
};

Sessions.prototype.refreshProgressBar = function() {
    var progress = this.sessions[this.current].getProgress();
    var total  = this.sessions[this.current].variantArray.length;
    var percent =  String((100*progress/total)|0) + "%";
    //var progressBar = document.getElementById("variantProgress");
    $("#variantProgress").attr("aria-valuenow", percent);
    $("#variantProgress").css("width", percent);
    //progressBar.setAttribute("aria-valuenow", percent);
    //progressBar.style.width = percent + "%";
    console.log('PROGRESSSSSSS BAR');
    console.log(progress);
    console.log(total);
    console.log(percent);
};


