"use strict";

var baseCoverage = {styles: [ { "type": "density", "zoom": "low", "style": { "glyph": "HISTOGRAM",  "COLOR1": "gray", "HEIGHT": 30 } }, { "type": "density", "zoom": "medium", "style": {"glyph": "HISTOGRAM", "COLOR1": "gray",  "HEIGHT": 30 } }, { "type":  "base-coverage", "zoom": "high", "style": { "glyph":  "HISTOGRAM", "COLOR1": "lightgray", "BGITEM":true, "HEIGHT": 110 } } ] };

var mismatch = {styles: [ { "type": "density", "zoom": "low", "style": { "glyph": "HISTOGRAM", "COLOR1": "black", "COLOR2": "red", "HEIGHT": 30 } }, { "type": "density", "zoom": "medium", "style": { "glyph": "HISTOGRAM", "COLOR1": "black", "COLOR2": "red", "HEIGHT": 30 } }, { "type": "bam", "zoom": "high", "style": { "glyph": "__SEQUENCE", "HEIGHT": 8, "BUMP": true, "LABEL": false, "ZINDEX": 20, "__SEQCOLOR": "mismatch" } } ] };

var sessions = new Sessions();
var settings;
var displaySettings = [];
var storedSettings = localStorage.getItem("snoopySettings");

if (storedSettings) {
    settings = JSON.parse(storedSettings);
} else {
    settings = {
        defaultZoomLevelUnit : true,
        autoZoom : true,
        highlightDiff : true,
        currentZoom : false 
    }
}

$(document).ready(function() {

    // Listen for button to load files
    document.getElementById("fileLoaded").addEventListener("change", loadLocalFiles, false); 
    
    // Listen for button to load the dalliance viwer
    $("#loadDalliance").on("click", loadDalliance);

    // Listen for reload event
    $("#restart").on("click", function() {
        document.location.reload();
    });
    
    // Listen for download event
    $("#prepareDownloadQCreport").on("click", function() {
        sessions.promptQCdownload();
    });
   
    $("#downloadQCreport").on("click", function(){
        sessions.downloadQCreport();
        $("#modalDownloadQCreport").modal('hide');
    });
    
    // Listen for previous click
    $("#goBack").on("click", function() {
        sessions.prev();
    });
    
    // Listen for quality control
    $("#qcNotVariant").on("click", function() {
        sessions.setQC(-1);
    });

    $("#qcPotentialVariant").on("click", function() {
        sessions.setQC(0);
    });

    $("#qcCertainVariant").on("click", function() {
        sessions.setQC(1);
    });
    
    // Listen for return to current variant click
    $("#returnHome").on("click", function() {
        sessions.gotoCurrentVariant();
    });
    
    // Listen for load remote file prompt click
    $("#loadRemoteFileButton").on("click", function() {
        $("#modalLoadRemote").modal("show");
    });

    // Listen for load remote file OK click 
    $("#loadRemoteFile").on("click", function() {
        loadRemoteFile();
        $("#modalLoadRemote").modal('hide');
    });
    
    // Listen for load remote file prompt click
    $("#loadJSONbutton").on("click", function() {
        $("#modalLoadJSON").modal('show');
    });

    // Listen for load remote file prompt click
    $("#loadJSONfile").on("click", function() {
        loadJSONfile(); 
        $("#modalLoadJSON").modal('hide');
    });

});

$("#modalSettings").on("hidden.bs.modal", function (e) {
    settings.defaultZoomLevelUnit = $("#defaultZoomLevelUnit").prop("checked");
    settings.autoZoom = $("#autoZoom").prop("checked"); 
    settings.highlightDiff = $("#highlightDiff").prop("checked"); 

    if(!settings.defaultZoomLevelUnit) {
        var w = $("#zoomLevelText").val() | 0; // don't worry about type, it will be caught below
        if (w <= 0) { // if the user has not entered a sensible value use b.zoomMin
           settings.currentZoom = Math.exp(b.zoomMin/b.zoomExpt);
           settings.defaultZoomLevelUnit = true;
        } else {
        settings.currentZoom = w / b.zoomBase; 
        }
    }
    localStorage.setItem("snoopySettings", JSON.stringify(settings));

    for (var i=1; i<b.tiers.length; ++i) { 
        var cs = $("#displaySelect" + i).val(); 
        console.log(cs);
        if(cs === "mismatch") {
            b.tiers[i].init();
            displaySettings[i] = "mismatch";
        } else {
            b.tiers[i].setStylesheet(baseCoverage);
            displaySettings[i] = "coverage";
        }
    }
    b.refresh();
})

$("#modalSettings").on("show.bs.modal", function (e) {
    $("#defaultZoomLevelUnit").prop("checked", settings.defaultZoomLevelUnit);
    $("#defaultZoomLevelCurrent").prop("checked", !settings.defaultZoomLevelUnit);
    $("#autoZoom").prop("checked", settings.autoZoom); 
    $("#highlightDiff").prop("checked", settings.highlightDiff); 
    $("#zoomLevelText").val(b.zoomBase * settings.currentZoom);
    $("#zoomLevelText").focus(function() {
        $("#defaultZoomLevelCurrent").prop("checked", true);
    });

    $("#captureZoom").click(function() {
        $("#defaultZoomLevelCurrent").prop("checked", true);
        var cz = Math.round(b.viewEnd - b.viewStart);
        $("#zoomLevelText").val(cz);
    });
    var str = "<table style=\"width: 100%;\">";
    for (var i=1; i<b.tiers.length; ++i) { 
        var bamName = b.tiers[i].featureSource.source.bamSource.name;
        str += "<tr>";
        str += "<td>";
        str += bamName;
        str += "</td>";
        str += "<td colspan=\"2\">";
        str += "<select class=\"form-control\" id=\"displaySelect" + i + "\">";
        if (displaySettings[i] && displaySettings[i] === "coverage") {
            str += "<option value='mismatch'>Highlight mismatches</option>";
            str += "<option value='coverage' selected='selected'>Coverage histogram</option>";
        } else {
            str += "<option value='mismatch' selected='selected'>Highlight mismatches</option>";
            str += "<option value='coverage'>Coverage histogram</option>";
        }
        str += "</select>";
        str += "</td>";
        str += "</tr>";
    }
    str += "</table>"
    $("#displaySettings").html(str);

})


var b = new Browser({
    chr:          '22',
    viewStart:    30000000,
    viewEnd:      30000100,
    cookieKey:    'human-grc_h37',
    coordSystem: {
        speciesName: 'Human',
        taxon: 9606,
        auth: 'GRCh',
        version: '37',
        ucscName: 'hg19'
    },
    singleBaseHighlight : false,
    defaultHighlightFill : 'black',
    defaultHighlightAlpha : 0.10,
    maxHeight : 10000,
    noTrackAdder : false,
    noLeapButtons : true,
    noLocationField : true,
    noZoomSlider : false,
    noTitle : false,
    noTrackEditor : false,
    noExport : false,
    noOptions : false,
    noHelp : true,
    disableDefaultFeaturePopup : true,
    noPersist : true,
    noPersistView : true,
    sources: [
        {name: 'Genome',
            twoBitURI: 'http://www.biodalliance.org/datasets/hg19.2bit',
                tier_type: 'sequence',
            provides_entrypoints: true,
            pinned: true
    }],
//    setDocumentTitle: true,
    //uiPrefix: 'file:///Users/dr9/Developer/snoopy/dalliance/',
    fullScreen: false,

    browserLinks: {
        Ensembl: 'http://ncbi36.ensembl.org/Homo_sapiens/Location/View?r=${chr}:${start}-${end}',
            UCSC: 'http://genome.ucsc.edu/cgi-bin/hgTracks?db=hg19&position=chr${chr}:${start}-${end}',
                Sequence: 'http://www.derkholm.net:8080/das/hg19comp/sequence?segment=${chr}:${start},${end}'
    }
});

b.zoomMin = 20;

var bamFiles = [];
var baiFiles = [];
var variantFiles = [];
var listFiles = [];

function printFilesTable() {
    $("#loadedFilesPanel").remove();
    var str = '<div class="panel panel-default step-two" id="loadedFilesPanel">';
    str += '<div class="panel-heading">Loaded Files</div>';
    str += '<table class="table" id="loadedFilesTable">';
    if (sessions.sessions.length === 0) {
        str += printfArray(bamFiles);
        str += printfArray(baiFiles);
        str += printfArray(variantFiles);
        if (bamFiles.length + baiFiles.length + variantFiles.length === 0) {
            $("#loadedFilePanel, #loadDalliance").css("display", "none");
        } else {
 //           $("#loadedFilesTable").html(str);
            $("#loadedFilesPanel").css("display", "block");
            $("#loadDalliance").css("display", "inline");
            $("#welcome").css("margin-top", "5%");
            $("#loadJSONbutton, #choiceJSON").css("display", "none");
            $("#loadFilesText").html("Load More Files");
            str += '</table></div>';
            $(str).insertAfter("#choiceManual");
        }
    } else { // multi-session so need to print straight from the Sessions object
//        $("#loadedFilesPanel").css("display", "block");
        $("#loadDalliance").css("display", "inline");
        $("#welcome").css("margin-top", "5%");
        $("#loadRemoteFileButton, #choiceManual, #loadLocalFileButton").css("display", "none");
        str += sessions.print();
        str += '</table></div>';
        $(str).insertAfter("#choiceJSON");
    }
}


function loadLocalFiles() {
    var files = document.getElementById("fileLoaded").files;
    for (var i=0; i < files.length; ++i) {
        var f = files[i];
        switch (getExtension(f)) {
            case "bam":
                var newBam = new LocalBAM(f);
                bamFiles.push(newBam);
            break;
            case "bai":
                var newBai = new LocalBAI(f);
                baiFiles.push(newBai);
            break;
            case "txt":
                var newVariant = new LocalVariantFile(f);
                variantFiles.push(newVariant);
            break;
        }
    }

    for (var i=0; i < bamFiles.length; ++i) {
        console.log(i);
        console.log(bamFiles[i]);
        if (bamFiles[i]) {
            var baiEquivName = bamFiles[i].file.name + ".bai";
            var baiIndex = fileArrayContains(baiFiles, baiEquivName);
            if (baiIndex >= 0) {
                bamFiles[i].index = baiFiles.splice(baiIndex, 1)[0];
            }
        }
    }
    printFilesTable();
    resetFileLoaded();
};

function resetFileLoaded() {
    var oldFileLoad = document.getElementById("fileLoaded");
    var newFileLoad = makeElement('input', null, {id: 'fileLoaded', type: 'file', multiple: 'multiple'});
    newFileLoad.addEventListener("change", loadLocalFiles, false);
    var father = oldFileLoad.parentNode;
    console.log(father);
    father.replaceChild(newFileLoad, oldFileLoad); 
}

function loadRemoteFile() {
    var f = "https://web-lustre-01.internal.sanger.ac.uk/" + $("#remoteFilename").val();
    switch (getExtension(f)) {
        case "bam":
            var newBam = new RemoteBAM(f);
            bamFiles.push(newBam);
            printFilesTable();
        break;
       case "txt":
            var newVariantFile = new RemoteVariantFile(f);
            variantFiles.push(newVariantFile);
            printFilesTable();
        break;
    }
}

function loadJSONfile() {
    var f = $("#JSONfilename").val();
    if (getExtension(f) === "json") {
            $.ajax({
                url: "https://web-lustre-01.internal.sanger.ac.uk/" + f,
                xhrFields: { withCredentials: true }
            }).done(function(data) {
                loadJSON(data);
            });
    } 
}

function loadJSON(jsonFile) {
    console.log('it is here');
    var j = JSON.parse(jsonFile);
    var inSessions = j["sessions"];
    console.log(inSessions);
    // remove anything that may be loaded 
    variantFiles = [];
    bamFiles = [];
    baiFiles = [];
    var url = "https://web-lustre-01.internal.sanger.ac.uk/"; // does this need to be here? want to make it generic eventually
    for (var si=0; si<inSessions.length; si++) {
        var s = new Session();
        s.variantFile = new RemoteVariantFile(url + inSessions[si]["variant_locations"]);
        console.log(si);
        console.log(inSessions[si]["bams"]);
        for (var bi=0; bi<inSessions[si]["bams"].length; bi++) {
            console.log(bi);
            var newBam = new RemoteBAM(url + inSessions[si]["bams"][bi]);
            s.bamFiles.push(newBam);
        }
        sessions.addSession(s);
    } 
    printFilesTable();
}

function loadDalliance() {
    
    // Create and append select list
    var myDiv = document.getElementById("variantSelectHolder");
    var selectList = document.createElement("select");
    selectList.id = "variantSelect";
    selectList.className = "form-control";
    selectList.onchange = function() {
        sessions.updateByVariantSelect();
    } 
    myDiv.appendChild(selectList);

    if (sessions.sessions.length === 0) {
        // create a single session from whatever is present in the file loader
        var s = new Session(bamFiles, variantFiles[0]);
        sessions.addSession(s);
     } else {
        // a multi-session is already loaded
     }
     sessions.load(0);
     setTimeout(function() {
        if (settings.defaultZoomLevelUnit) { 
            b.zoomStep(-1000000);
        } else {
            b.zoom(settings.currentZoom);
        }
    }, 1000);

    $("#fileLoader").css("display", "none");
    $("#controlCenter, #progressBar").css("display", "block");
    $("#my-dalliance-holder").css("opacity", "1");
}

// Need to keep the remove*** functions seperate because they are called
// by clicking the remove button in the HTML
function removeBAM(index) {
    if (typeof(index) === "string") {
       index = parseInt(index);
    }
    bamFiles.splice(index, 1);
    printFilesTable();
}

function removeBAI(index) {
    if (typeof(index) === "string") {
        index = parseInt(index);
    }
    baiFiles.splice(index, 1);
    printFilesTable();
}

function removeVariantFile(index) {
    if (typeof(index) === "string") {
        index = parseInt(index);
    }
    variantFiles.splice(index, 1);
    printFilesTable();
}

var fileArrayContains = function(fArray, fname) {
    for (var i=0; i < fArray.length; ++i) {
        var f = fArray[i];      
        if (f.file.name === fname) {
            return i;
        }
    }
    return -1;
};

var printfArray = function(fArray) {
    var str = ""
    for (var i=0; i<fArray.length; ++i) {
        str += fArray[i].print(i);
    }
    return str;
}

function getExtension(f) {
    if (typeof(f) !== "string") {
        f = f.name;
    }
    var parts = f.split(".");
    return parts[parts.length - 1].toLowerCase();
}

function getName(f) {
    if (typeof(f) !== "string") {
        f = f.name;
    }
    var parts = f.split("/");
    return parts[parts.length - 1];
}
