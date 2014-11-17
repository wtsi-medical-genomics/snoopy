"use strict";

//requirejs.config({
//    baseUrl: 'lib',
//    paths: {
//        app: '../app'
//    }
//});

var v = new variantLocations();
var settings;
    
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
    document.getElementById("fileLoaded").addEventListener("change", loadFiles, false);
    // Listen for butoon to load the dalliance viwer
    document.getElementById("loadDalliance").addEventListener("click", loadDalliance, false);

    // Listen for reload event
    document.getElementById("restart").addEventListener("click", function(){document.location.reload();}, false);
//    document.getElementById("loadModalHelp").addEventListener("click", function(){
//        $("#modalHelp").modal('show');
//    }, false);
    // Listen for download event
    document.getElementById("prepareDownloadQCreport").addEventListener("click", function(){generateQCreport();}, false);
    document.getElementById("downloadQCreport").addEventListener("click", function(){
        v.generateQCreport();
        $("#modalDownloadQCreport").modal('hide');
    }, false);
    // Listen for previous click
    document.getElementById("goBack").addEventListener("click", function(){v.prev();}, false);
    // Listen for quality control
    document.getElementById("qcNotVariant").addEventListener("click", function(){v.setQC(-1);}, false);
    document.getElementById("qcPotentialVariant").addEventListener("click", function(){v.setQC(0);}, false);
    document.getElementById("qcCertainVariant").addEventListener("click", function(){v.setQC(1);}, false);
    document.getElementById("returnHome").addEventListener("click", function(){v.gotoCurrentVariant();}, false);
    $("#loadRemoteFileButton").on("click", function() {
        $("#modalLoadRemote").modal("show");

    });

    $("#loadRemoteFile").on("click", function() {
        loadRemoteFile();
        $("#modalLoadRemote").modal('hide');
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
    console.log(settings);
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
    console.log(settings);
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
        ucscName: 'hg19',
    },

    chains: {
        hg18ToHg19: new Chainset('http://www.derkholm.net:8080/das/hg18ToHg19/', 'NCBI36', 'GRCh37',
                                 {
            speciesName: 'Human',
            taxon: 9606,
            auth: 'GRCh',
            version: 37
        })
    },
    singleBaseHighlight : false,
    defaultHighlightFill : 'black',
    defaultHighlightAlpha : 0.15,
    maxHeight : 550,
    noTrackAdder : false,
    noLeapButtons : true,
    noLocationField : true,
    noZoomSlider : false,
    noTitle : false,
    noTrackEditor : false,
    noExport : true,
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
    setDocumentTitle: true,
    //uiPrefix: 'file:///home/daniel/repositories/snpshow/dalliance/',
    uiPrefix: 'file:///Users/dr9/Developer/snoop/dalliance/',
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
    console.log(bamFiles);
    var str = printfArray(bamFiles);
    str += printfArray(baiFiles);
    str += printfArray(variantFiles);
    document.getElementById("loadedFilesTable").innerHTML = str;
    if (bamFiles.length + baiFiles.length + variantFiles.length === 0) {
        document.getElementById("loadedFilesPanel").setAttribute("style", "display:none");
        document.getElementById("loadDalliance").setAttribute("style", "display:none");
        //document.getElementById("loadFiles").setAttribute("style", "margin-top: 20px");
    } else {
        document.getElementById("loadedFilesPanel").setAttribute("style", "display:block");
        document.getElementById("loadDalliance").setAttribute("style", "display:inline");
       // document.getElementById("loadFiles").setAttribute("style", "margin-top: 0px");
        document.getElementById("stepOne").setAttribute("style", "margin-top: 5%");
        document.getElementById("loadFilesText").innerHTML = "Load More Files";
    }
}


function generateQCreport() {
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
}

function loadFiles() {
    var files = document.getElementById("fileLoaded").files;
    for (var i=0; i < files.length; ++i) {
        var f = files[i];
        switch (getExtension(f)) {
            case "bam":
                var newBam = new LoadedBamFile(f);
            bamFiles.push(newBam);
            break;
            case "bai":
                var newBai = new LoadedBaiFile(f);
            baiFiles.push(newBai);
            break;
            case "txt":
                var newVariant = new LoadedVariantFile(f);
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

    /* console.log(BAMfile);
    console.log(BAIfile);
    console.log(variantFile);

    var reader = new FileReader();
    reader.readAsText(variantFile);
    reader.onload = function() {
    console.log(reader.result);
    v.processVariantFile(reader.result);
    v.gotoCurrentVariant();
    }

    var myBAM = {
    baiBlob : BAIfile,
    bamBlob : BAMfile,
    name : "example",
    noPersist : true,
    };

    b.addTier(myBAM);
*/
    resetFileLoaded();
};

function resetFileLoaded() {
    var oldFileLoad = document.getElementById("fileLoaded");
    var newFileLoad = makeElement('input', null, {id: 'fileLoaded', type: 'file', multiple: 'multiple'});
    newFileLoad.addEventListener("change", loadFiles, false);
    var father = oldFileLoad.parentNode;
    console.log(father);
    father.replaceChild(newFileLoad, oldFileLoad); 
}

function loadRemoteFile() {
    var f = $("#remoteFilename").val();
    console.log(f);
    switch (getExtension(f)) {
        case "bam":
            var newBam = new RemoteBam(f);
            bamFiles.push(newBam);
            printFilesTable();
        break;
        case "json":
            $.ajax({
                url: "https://web-lustre-01.internal.sanger.ac.uk/" + f,
                xhrFields: { withCredentials: true }
            }).done(function(data) {
               loadListFileContents(data);
            });
        break;
        case "txt":
            var newVariant = new LoadedVariantFile(f);
            variantFiles.push(newVariant);
            printFilesTable();
        break;
    }
    console.log('print the files!'); 
}

function loadListFileContents(jsonFile) {
    console.log('what the heck');
    var fileObj = JSON.parse(jsonFile);
    var newVariant = new RemoteVariantList(fileObj.variant_locations);
    variantFiles.push(newVariant);
    
    for (var i=0; i < fileObj.bams.length; ++i) { 
        var newBam = new RemoteBam(fileObj.bams[i]);
        bamFiles.push(newBam);
    }
    printFilesTable();
}

function loadDalliance() {
    for (var i=0; i < bamFiles.length; ++i) {
        var bamObj = bamFiles[i].getTier();
        if (bamObj) { 
            console.log(bamObj);
            b.addTier(bamObj);
        } 
    }

    //Create and append select list
    var myDiv = document.getElementById("variantSelectListHolder");
    var selectList = document.createElement("select");
    selectList.id = "mySelect";
    selectList.className = "form-control";
    selectList.onchange = function(){v.updateByList();};
    myDiv.appendChild(selectList);

    v.init(variantFiles[0]);

    setTimeout(function() {
        if (settings.defaultZoomLevelUnit) { 
            b.zoomStep(-1000000);
        } else {
            b.zoom(settings.currentZoom);
        }
    }, 1000);
    document.getElementById("fileLoader").setAttribute("style", "display: none");
    document.getElementById("controlCenter").setAttribute("style", "display: block");
    document.getElementById("progressBar").setAttribute("style", "display: block");
    //document.getElementById("my-dalliance-holder").setAttribute("style", "opactiy: 1");
    document.getElementById("my-dalliance-holder").style.opacity = "1";

}


