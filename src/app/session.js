"use strict";

var variants = require('./variant.js');
var SNP = variants.SNP;
var CNV = variants.CNV;
var utils = require('./utils.js');
var getExtension = utils.getExtension;
var UID = utils.UID;
var styleSheets = require('./styles.js');
var loadedfiletypes = require('./loadedfiletypes.js');
var RemoteBAM = loadedfiletypes.RemoteBAM;
var RemoteBAI = loadedfiletypes.RemoteBAI;
var LocalBAM = loadedfiletypes.LocalBAM;
var LocalBAI = loadedfiletypes.LocalBAI;


var uid = new UID();

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

Session.prototype.init = function(fileText, fileName) {
    this.processVariantFile(fileText, fileName);
    this.gotoCurrentVariant();
    //this.refreshVariantList();
};


Session.prototype.remove = function(id) {
    this.bamFiles = this.bamFiles.filter(function(bamFile) {
        return bamFile.id !== id;
    })
    this.baiFiles = this.baiFiles.filter(function(baiFile) {
        return baiFile.id !== id;
    })
};

Session.prototype.addFile = function(file) {
    if (typeof(file) === 'string') {
        switch (getExtension(file)) {
            case "bam":
                var newBam = new RemoteBAM(file, uid.next());
                this.bamFiles.push(newBam);
                break;
            case "bai":
                var newBai = new RemoteBAI(file, uid.next());
                this.baiFiles.push(newBai);
                break;
        }
    } else {
        for (var i=0; i < file.length; ++i) {
            var f = file[i];
            switch (getExtension(f)) {
                case "bam":
                    var newBam = new LocalBAM(f, uid.next());
                    this.bamFiles.push(newBam);
                    break;
                case "bai":
                    var newBai = new LocalBAI(f, uid.next());
                    this.baiFiles.push(newBai);
                    break;
            }
        }
    }
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
            }
            this.variants.push(v);
    }
    // setup the bam files 

    //this.loadTiers();
    //this.gotoCurrentVariant();
    //this.refreshVariantList();
    //app.renderFileList();
};

Session.prototype.reload = function(variantIndex) {
    // // setup the bam files 
    // for (var i=0; i < this.bamFiles.length; ++i) {
    //     var bamTier = this.bamFiles[i].getTier();
    //     if (bamTier) { 
    //         console.log(bamTier);
    //         app.browser.addTier(bamTier);
    //     }
    // }
    this.loadTiers();
    this.gotoCurrentVariant();
    //this.refreshVariantList();
};

Session.prototype.loadTiers = function() {
    this.browser.removeAllTiers();
    //this.browser.baseColors = app.settings.colors;
    this.browser.addTier(referenceGenome);
    for (var i=0; i < this.bamFiles.length; ++i) {
        var style = styleSheets['raw'].styles;
        var bamTier = this.bamFiles[i].getTier(style);
        // if (app.settings.dallianceView === 'condensed')
        //     bamTier.padding = 0;
        // if (bamTier) { 
        //     app.browser.addTier(bamTier);
        // } 
        this.browser.addTier(bamTier);
    }
    //app.browser.refresh();
}

Session.prototype.refreshStyles = function() {
    // get styles and update each tier
    app.browser.baseColors = app.settings.colors;
    for (var i=1; i<app.browser.tiers.length; ++i) {
        var style = app.settings.styles[app.settings.dallianceView];
        console.log(app.browser.tiers[i]);
        console.log(style);
        app.browser.tiers[i].setStylesheet(style);
        if (app.settings.dallianceView === 'condensed')
            app.browser.tiers[i].padding = 0;
        console.log('app.browser.tiers[i].padding: ' + app.browser.tiers[i].padding);
    }
    app.browser.refresh();
}

Session.prototype.updateByVariantSelect= function() {
    var selected = document.getElementById("variantSelect");
    this.index = parseInt(selected.value);
    this.gotoCurrentVariant();
};

Session.prototype.setQC = function(decision) {
    this.variants[this.index].score = decision;
};

Session.prototype.screenshot = function() {
    // Take a screenshot
    var imgdata = app.browser.exportImage();
    imgdata = imgdata.split(',');
    if (imgdata.length === 2) {
        var screenshot = imgdata[1];
        var imgName = '';
        this.bamFiles.forEach(function(f) {
            imgName += f.name
        });
        imgName += this.variants[this.index].string()
        app.imageFolder.file(imgName + '.png', screenshot, {base64: true});
    } else {
        console.log('more than two parts to the image');
    }
}

Session.prototype.print = function(backgroundColor) {
    var str = this.variantFile.print(null, false, backgroundColor);
    for (var i=0; i<this.bamFiles.length; i++) {
        str += this.bamFiles[i].print(null, false, backgroundColor);
    }
    return str;
}

Session.prototype.getProgress = function() {
    var progress = 0;
    for (var i=0; i<this.variants.length; i++) {
        if(this.variants[i].score > -99) {
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
    for (var i = 0; i < this.variants.length; i++) {
        str += this.variants[i].string() + "\n"; 
    }
    return str;
};

Session.prototype.refreshVariantList = function() {

    var stringArray = this.getStringArray();
    var selectList = $("#variantSelect"); 

    selectList.empty() // get rid of any current variants
    //Create and append the options
    for (var i = 0; i < stringArray.length; i++) {
        selectList.append($("<option>").attr('value', i).html(stringArray[i]));
    }
    selectList.val(this.index);
};

function formatLongInt(n) {
    return (n|0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
};

Session.prototype.getStringArray = function() {
    var stringArray = Array(this.variants.length);
    for (var i = 0; i<this.variants.length; i++) {
        stringArray[i] = this.variants[i].prettyString();
    }
    return stringArray;
};

Session.prototype.variantHTML = function() {
    return this.variants[index].html();
}

Session.prototype.gotoCurrentVariant = function() {
    this.variants[this.index].visit();
    // if (app.settings.autoZoom) {
    //     if (app.settings.defaultZoomLevel === 'unit') { 
    //         app.browser.zoomStep(-1000000);
    //     } else {
    //         app.browser.zoom(app.settings.customZoom);
    //     }
    // }
    console.log('sending variants to the variant list template');
    app.renderVariantList(this.variants[this.index].html());
    //document.getElementById("variantSelect").value = this.current;
};

Session.prototype.next = function() {
    if ((this.index + 1) < this.variants.length) {
        this.index++;
        this.gotoCurrentVariant();
        return true;
    } else { // at the end now
        //document.getElementById("variantSelect").value = this.index;
        app.renderVariantList(this.variants[this.index].html());
        return false;
    }
};

Session.prototype.prev = function() {
    if (this.index > 0) {
        this.index--;
        this.gotoCurrentVariant();
        return true;
    } else {
        return false;
    }
};

Session.prototype.goto = function(variantIndex) {
    this.index = variantIndex;
    console.log('this.bamFiles.length: ' + this.bamFiles.length);
    if (app.browser.tiers.length === 0)
        this.loadTiers();
    this.gotoCurrentVariant();
}

function Sessions() {
    this.sessions = [];
    this.index = null;
}

Sessions.prototype.refreshStyles = function() {
    this.sessions[this.index].refreshStyles();
}

Sessions.prototype.goto = function(sessionIndex, variantIndex) {
    // determine if the sessionIndex has changed
    if (this.index === sessionIndex) {
        if (typeof(variantIndex) === 'undefined')
            this.sessions[this.index].gotoCurrentVariant();
        else
            this.sessions[this.index].goto(variantIndex);
    } else {
        app.browser.removeAllTiers();
        this.index = sessionIndex;
        this.sessions[this.index].goto(variantIndex);
    }
}

Sessions.prototype.gotoCurrentVariant = function() {
    this.sessions[this.index].gotoCurrentVariant();
}

Sessions.prototype.load = function(sessionIndex, variantIndex) {
    if (typeof(variantIndex) === 'undefined')
        this.goto(sessionIndex)
    else
        this.goto(sessionIndex, variantIndex)
}

/** This method is called upon starting QC */
Sessions.prototype.init = function() {
    this.browser = new Browser({
      chr:          '18',
      viewStart:    117141,
      viewEnd:      117341,
      // chr:          '16',
      // viewStart:    48000629,
      // viewEnd:      48000820,
      // noPersistView : true,
      cookieKey:    'human-grc_h37',
      coordSystem: {
        speciesName: 'Human',
        taxon: 9606,
        auth: 'GRCh',
        version: '37',
        ucscName: 'hg19'
      },
      maxHeight : 10000,
      setDocumentTitle: true,
      //uiPrefix: window.location.origin + '/',
      fullScreen: true,
      disableDefaultFeaturePopup : true,
      noPersist : true,
      maxWorkers : 3,
      baseColors: {
        A: 'green', 
        C: 'blue', 
        G: 'orange', 
        T: 'red',
        '-' : 'black', // deletion
        I : 'mediumpurple' // insertion
      },
      sources: [
        {
          name: 'Genome',
          twoBitURI: 'http://www.biodalliance.org/datasets/hg19.2bit',
          tier_type: 'sequence',
          provides_entrypoints: true,
          pinned: true
        }
      ]
    });
    this.browser.addInitListener(function() {
        this.index = 0;
        this.sessions[this.index].index = 0;
        this.sessions[this.index].browser = this.browser;
        this.sessions[this.index].loadTiers(this);
        this.sessions[this.index].gotoCurrentVariant();
    }.bind(this))
}

Sessions.prototype.getLength = function() {
    var length = 0;
    for (var i=0; i<this.sessions.length; i++) {
        length += this.sessions[i].getLength();
    }
    return length;
}

Sessions.prototype.setQC = function(decision) {
    this.sessions[this.index].setQC(decision);
    this.sessions[this.index].screenshot();

    if (!this.sessions[this.index].next()) {
        if (this.index < this.sessions.length - 1) {
//            console.log('I still live');
//            var progress = this.sessions[this.current].getProgress(); 
//            var total = this.sessions[this.current].variants.length;
//            var message = "You have reviewed <b>" + progress + "</b> of <b>" + total + "</b> variant locations. Do you want to continue to the next set of variants?";
//            $('#modalConfirmNextSet .modal-body').html(message);
//            $('#modalConfirmNextSet').modal('show');
            this.goto(this.index + 1, 0);
        } else {
            this.promptQCdownload();
        }
    }
    this.refreshProgressBar();
    //this.renderVariantList();
}

Sessions.prototype.prev = function() {
    if (!this.sessions[this.index].prev()) {
        if (this.index > 0) {
            var variantIndex = this.sessions[this.index - 1].variants.length - 1
            this.goto(this.index - 1, variantIndex);
        }
    }
}

Sessions.prototype.getCurrent = function() {
    return this.sessions[this.index];
}; 

Sessions.prototype.downloadQCreport = function() {

    var str = Date();
    
    for (var i=0; i<this.sessions.length; i++) {
        str += this.sessions[i].generateQCreport();
    }
    
    var out = $("#QCreportFilename").val();
    var blob = new Blob([str], {type: "text/plain;charset=utf-8"});
    saveAs(blob, out);

    var content = app.zip.generate({type:"blob"});
    saveAs(content, "results.zip");
};

Sessions.prototype.getNumberVariants = function() {
    var numVariants = 0;
    for (var i=0; i<this.sessions.length; i++) {
        numVariants += this.sessions[i].variants.length;
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
        selectList.val(this.index);
        $("#sessionSelectHolder").html(selectList);
    } else {
        var button = '<button type="button" class="btn btn-default" disabled="disabled">' + this.sessions[0].variantFile.name  + '</button>';
        $("#sessionSelectHolder").html(button);
    }
};

Sessions.prototype.refreshProgressBar = function() {
    var progress = this.sessions[this.index].getProgress();
    var total  = this.sessions[this.index].variants.length;
    var percent =  String((100*progress/total)|0) + "%";
    $("#variantProgress").attr("aria-valuenow", percent);
    $("#variantProgress").css("width", percent);
};

module.exports = {
    Sessions: Sessions,
    Session: Session,
}