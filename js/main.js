"use strict";

// var displaySettings = [];
// mismatch.styles[2].style._plusColor = settings.plusColor;
// mismatch.styles[2].style._minusColor = settings.minusColor;
var App
$(function() {
    App = {
        init: function() {
            console.log('here');
            this.view = 'loadFiles'
            this.sessions = new Sessions();
            this.cacheElements();
            this.bindEvents();
            // var storedSettings = localStorage.getItem("snoopySettings");
            // if (storedSettings) {
            //     this.settings = JSON.parse(storedSettings);
            // } else {
                this.settings = {
                    serverLocation: 'https://web-lustre-01.internal.sanger.ac.uk/',
                    defaultZoomLevel: 'unit',
                    autoZoom: true,
                    customZoom: false,
                    defaultView: 'mismatch',
                    plusColor: '#FFEBD7',
                    minusColor: '#BED8EA',
                }
            //}
        },

        cacheElements: function() {
            this.$app = $('#app');
            this.$buttonLoadDalliance = this.$app.find('#buttonLoadDalliance');
            this.$buttonRestart = this.$app.find('#buttonRestart');
            this.$buttonPrepareDownloadQCreport = this.$app.find('#buttonPrepareDownloadQCreport');
            this.$buttonDownloadQCreport = this.$app.find('#buttonDownloadQCreport');
            this.$buttonGoBack = this.$app.find('#buttonGoBack');
            this.$buttonQCNotVariant = this.$app.find('#buttonQCNotVariant');
            this.$buttonQCPotentialVariant = this.$app.find('#buttonQCPotentialVariant');
            this.$buttonQCCertainVariant = this.$app.find('#buttonQCCertainVariant');
            this.$buttonShowRemoteFileModal = this.$app.find('#buttonLoadRemoteFile');
            this.$buttonLoadRemoteFile = this.$app.find('#buttonLoadRemoteFile');
            this.$buttonShowLoadJSONModal = this.$app.find('#buttonShowLoadJSONModal');
            this.$buttonLoadJSONFile = this.$app.find('#buttonLoadJSONFile');
            this.$modalDownloadQCreport = this.$app.find('#modalDownloadQCreport');
            this.$modalLoadRemote = this.$app.find('#modalLoadRemote');
            this.$modalLoadJSON = this.$app.find('#modalLoadJSON');
            this.$modalSettings = this.$app.find('#modalSettings');
            this.settingsTemplate = _.template($("#settingsTemplate").html());
            this.$targetSettings = this.$app.find('#targetSettings');


        },

        bindEvents: function() {
            // Listen for button to load files
            document.getElementById('fileLoaded').addEventListener('change', loadLocalFiles, false);
            this.$buttonLoadDalliance.on('click', this.loadDalliance.bind(this));
            this.$buttonRestart.on('click', this.reload.bind(this));
            this.$buttonPrepareDownloadQCreport.on('click', this.sessions.promptQCdownload.bind(this));
            this.$buttonDownloadQCreport.on('click', this.downloadQCreport.bind(this));
            this.$buttonGoBack.on('click', this.goBack.bind(this));
            this.$buttonQCNotVariant.on('click', this.qcNotVariant.bind(this));
            this.$buttonQCPotentialVariant.on('click', this.qcPotentialVariant.bind(this));
            this.$buttonQCCertainVariant.on('click', this.qcCertainVariant.bind(this));
            this.$buttonShowRemoteFileModal.on('click', this.showRemoteFileModal.bind(this));
            this.$buttonLoadRemoteFile.on('click', this.loadRemoteFile.bind(this));
            this.$buttonShowLoadJSONModal.on('click', this.showLoadJSONModal.bind(this));
            this.$buttonLoadJSONFile.on('click', this.loadJSONFile.bind(this));
            this.$modalSettings.on('hidden.bs.modal', this.hideSettingsModal.bind(this));
            this.$modalSettings.on('show.bs.modal', this.showSettingsModal.bind(this));
            this.$targetSettings.on('change', "#selectTierStyle", this.selectTierStyle.bind(this));
            this.$targetSettings.on('click', "#captureZoom", this.captureZoom.bind(this));
            this.$targetSettings.on('click', '#captureZoom', this.selectCustomZoom.bind(this));
            this.$targetSettings.on('focus', '#zoomLevelText', this.selectCustomZoom.bind(this));

        },
        reload: function() {
            document.location.reload();
        },
        promptQCdownload: function() {
            this.$modalDownloadQCreport.modal('show');
        },
        downloadQCreport: function() {
            this.sessions.downloadQCreport();
            this.$modalDownloadQCreport.modal('hide');
        },
        goBack: function() {
            this.sessions.prev();
        },
        qcNotVariant: function() {
            this.sessions.setQC(-1);
        },
        qcPotentialVariant: function() {
            this.sessions.setQC(0);
        },
        qcCertainVariant: function() {
            this.sessions.setQC(1);
        },
        selectTierStyle: function() {
            var $mismatchOptions = this.$targetSettings.find('#mismatchOptions'),
                $coverageOptions = this.$targetSettings.find('#coverageOptions'),
                $selectTierStyle = this.$targetSettings.find('#selectTierStyle');
            
            $mismatchOptions.hide();
            $coverageOptions.hide();
            switch($selectTierStyle.val()) {
                case "mismatch":
                    $mismatchOptions.show();
                    break;
                case "coverage":
                    $coverageOptions.show();
                    break;
            }
        },
        captureZoom: function() {
            console.log('captureZoom');
            var $zoomLevelText = this.$targetSettings.find('#zoomLevelText'),
                $zoomRadio = $('input:radio[name="defaultZoomLevel"]'),
                cz = Math.round(b.viewEnd - b.viewStart);

            $zoomLevelText.val(cz);  
            //$("#defaultZoomLevel").prop("checked", true);
            $zoomRadio.filter('[value="custom"]').prop('checked', true);
              
              
        },
        selectCustomZoom: function() {
            var $zoomRadio = $('input:radio[name="defaultZoomLevel"]');
            $zoomRadio.filter('[value="custom"]').prop('checked', true);
        },
        showRemoteFileModal: function() {
            this.$modalLoadRemote.modal("show");
        },
        loadRemoteFile: function() {
            this.loadRemoteFile2();
            this.$modalLoadRemote.modal('hide');
        },
        showLoadJSONModal: function() {
            console.log('inside showLoadJSONModal');

            this.$modalLoadJSON.modal('show');
        },
        loadJSONFile: function() {
            this.loadJSONFile2(); 
            this.$modalLoadJSON.modal('hide');
        },
        hideSettingsModal: function() {

            var customZoom = this.$targetSettings.find('#zoomLevelText').val().trim() | 0;
            customZoom /= b.zoomBase;
            
            // User has not entered something sensible so assign something worthwhile
            if (customZoom < 0)
                customZoom = Math.exp(b.zoomMin/b.zoomExpt);

            this.settings = {
                serverLocation:   this.$targetSettings.find('#serverLocation').val().trim(),
                defaultZoomLevel: $('input:radio[name="defaultZoomLevel"]:checked').val(),
                autoZoom:         this.$targetSettings.find('#autoZoom').prop('checked'),
                customZoom:       customZoom,
                defaultView:      this.$targetSettings.find('#selectTierStyle').val(),
                plusColor:        this.$targetSettings.find('#plusStrandColor').val(),
                minusColor:       this.$targetSettings.find('#minusStrandColor').val()

            };
            console.log(this.settings);
            //     //     defaultView: 'mismatch',
            //     //     plusColor: '#FFEBD7',
            //     //     minusColor: '#BED8EA',
            //     // }

            // // this.settings = {
            // //     serverLocation: 
            //     defaultZoomLevelUnit = $("#defaultZoomLevelUnit").prop("checked");
            // this.settings.autoZoom = $("#autoZoom").prop("checked"); 
            // this.settings.plusColor = $("#plusStrandColor").val();
            // this.settings.minusColor = $("#minusStrandColor").val();

            // if(!this.settings.defaultZoomLevelUnit) {
            //     var w = $("#zoomLevelText").val() | 0; // don't worry about type, it will be caught below
            //     if (w <= 0) { // if the user has not entered a sensible value use b.zoomMin
            //     this.settings.currentZoom = Math.exp(b.zoomMin/b.zoomExpt);
            //     this.settings.defaultZoomLevelUnit = true;
            //     } else {
            //         settings.currentZoom = w / b.zoomBase; 
            //     }
            // }

            // for (var i=1; i<b.tiers.length; ++i) { 
            //     var cs = $("#displaySelect" + (i - 1)).val(); 
            //     console.log(cs);
            //     if(cs === "mismatch") {
            //         //b.tiers[i].init();
            //         b.tiers[i].setStylesheet(mismatch);
            //         displaySettings[i - 1] = "mismatch";
            //     } else {
            //         b.tiers[i].setStylesheet(baseCoverage);
            //         displaySettings[i - 1] = "coverage";
            //     }
            //     b.tiers[i].stylesheet.styles[2].style._plusColor = settings.plusColor;
            //     b.tiers[i].stylesheet.styles[2].style._minusColor = settings.minusColor;
            // }
            // setTimeout(function(){b.refresh()}, 1000);

            // this.settings.defaultView = displaySettings[0];
            // localStorage.setItem("snoopySettings", JSON.stringify(this.settings));
        },
        showSettingsModal: function() {
            console.log('in showSettingsModal');
            console.log(this.settings);
            this.$targetSettings.html(this.settingsTemplate({
                    settings: this.settings,
                    zoomLevel: this.settings.customZoom * b.zoomBase,
                    view: this.view
                }));

            //$("#zoomLevelText").val(b.zoomBase * this.settings.currentZoom);


            //$("#captureZoom").click(function() {
            //    $("#defaultZoomLevelCurrent").prop("checked", true);
             //   var cz = Math.round(b.viewEnd - b.viewStart);
              //  $("#zoomLevelText").val(cz);
            //});
        },
        loadJSONFile2: function () {
            var f = $("#JSONfilename").val();
            if (getExtension(f) === "json") {
                $.ajax({
                    url: "https://web-lustre-01.internal.sanger.ac.uk/" + f,
                    xhrFields: { withCredentials: true }
                }).done(function(data) {
                    this.loadJSON(data);
                }.bind(this));
            }
        },

        loadJSON: function(jsonFile) {
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
                this.sessions.addSession(s);
            }
            this.printFilesTable();
        },
        printFilesTable: function() {
            $("#loadedFilesPanel").remove();
            var str = '<div class="panel panel-default step-two" id="loadedFilesPanel">';
            str += '<div class="panel-heading">Loaded Files</div>';
            str += '<table class="table" id="loadedFilesTable">';
            if (this.sessions.sessions.length === 0) {
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
                str += this.sessions.print();
                str += '</table></div>';
                $(str).insertAfter("#choiceJSON");
            }
        },
        loadDalliance: function() {
            // Create and append select list
            var myDiv = document.getElementById("variantSelectHolder");
            var selectList = document.createElement("select");
            selectList.id = "variantSelect";
            selectList.className = "form-control";
            selectList.onchange = function() {
                this.sessions.updateByVariantSelect();
            } 
            myDiv.appendChild(selectList);

            if (this.sessions.sessions.length === 0) {
                // create a single session from whatever is present in the file loader
                var s = new Session(bamFiles, variantFiles[0]);
                this.sessions.addSession(s);
            } else {
                // a multi-session is already loaded
            }
            this.sessions.load(0);
            // setTimeout(function() {
            //     if (this.settings.defaultZoomLevelUnit) { 
            //         b.zoomStep(-1000000);
            //     } else {
            //         b.zoom(this.settings.currentZoom);
            //     }
            // }, 1000);

            $("#fileLoader").css("display", "none");
            $("#controlCenter, #progressBar").css("display", "block");
            $("#my-dalliance-holder").css("opacity", "1");
        }
    }

    App.init();
});



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
maxHeight : 1000,
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
