"use strict";

// var displaySettings = [];
// mismatch.styles[2].style._plusColor = settings.plusColor;
// mismatch.styles[2].style._minusColor = settings.minusColor;
var App, utils;



$(function() {
    utils = {
        getExtension: function(f) {
            if (typeof(f) !== "string") {
                f = f.name;
            }
            var parts = f.split(".");
            return parts[parts.length - 1].toLowerCase();
        }  
    }

    App = {
        init: function() {
            console.log('here');
            this.view = 'loadFiles';
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

            this.$localFile = this.$app.find('#fileLoaded');
            this.$buttonLoadDalliance = this.$app.find('#buttonLoadDalliance');
            this.$buttonRestart = this.$app.find('#buttonRestart');
            this.$buttonPrepareDownloadQCreport = this.$app.find('#buttonPrepareDownloadQCreport');
            this.$buttonDownloadQCreport = this.$app.find('#buttonDownloadQCreport');
            this.$buttonGoBack = this.$app.find('#buttonGoBack');
            this.$buttonQCNotVariant = this.$app.find('#buttonQCNotVariant');
            this.$buttonQCPotentialVariant = this.$app.find('#buttonQCPotentialVariant');
            this.$buttonQCCertainVariant = this.$app.find('#buttonQCCertainVariant');
            this.$buttonShowRemoteFileModal = this.$app.find('#buttonShowRemoteFileModal');
            this.$buttonLoadRemoteFile = this.$app.find('#buttonLoadRemoteFile');
            this.$buttonShowLoadRemoteFileModal = this.$app.find('#buttonShowLoadRemoteFileModal');
            this.$buttonLoadJSONFile = this.$app.find('#buttonLoadJSONFile');
            this.$modalDownloadQCreport = this.$app.find('#modalDownloadQCreport');
            this.$modalLoadRemote = this.$app.find('#modalLoadRemote');
            this.$modalSettings = this.$app.find('#modalSettings');
            this.settingsTemplate = _.template($("#settingsTemplate").html());
            this.$fileLoadingFileListTarget = this.$app.find('#fileLoadingFileListTarget');
            this.fileLoadingFileListTemplate = _.template($("#fileLoadingFileListTemplate").html());
            this.$fileLoadingErrorListTarget = $("#fileLoadingErrorListTarget");
            this.fileLoadingErrorListTemplate = _.template($("#fileLoadingErrorListTemplate").html());

            this.$targetSettings = this.$app.find('#targetSettings');
            this.$serverLocation = this.$app.find('.serverLocation');
            this.$buttonGoManual = this.$app.find('#buttonGoManual');
            this.$buttonGoBatch = this.$app.find('#buttonGoBatch');
            
            this.$formLoadURL = this.$app.find('#modalLoadRemote');

            this.$remoteFilename = this.$app.find('#remoteFilename');
            
            this.$paragraphManual = this.$app.find('#paragraphManual');
            this.$paragraphBatch = this.$app.find('#paragraphBatch');
            this.$paragraphWelcome = this.$app.find('#paragraphWelcome');
            
            this.$panelWelcome = this.$app.find('#panelWelcome');
            this.$panelManual = this.$app.find('#panelManual');
            this.$panelBatch = this.$app.find('#panelBatch');

            this.$sectionLoadFiles = this.$app.find('#sectionLoadFiles');
            this.$sectionPickMode = this.$app.find('#sectionPickMode');
            
            this.$fileLoadingAlert = this.$app.find('#fileLoadingAlert');


        },

        bindEvents: function() {
            // Listen for button to load files
            //document.getElementById('fileLoaded').addEventListener('change', loadLocalFiles, false);
            this.$localFile.on('change', this.loadLocalFile.bind(this));
            this.$buttonLoadDalliance.on('click', this.loadDalliance.bind(this));
            this.$buttonRestart.on('click', this.reload.bind(this));
            this.$buttonPrepareDownloadQCreport.on('click', this.sessions.promptQCdownload.bind(this));
            this.$buttonDownloadQCreport.on('click', this.downloadQCreport.bind(this));
            this.$buttonGoBack.on('click', this.goBack.bind(this));
            this.$buttonQCNotVariant.on('click', this.qcNotVariant.bind(this));
            this.$buttonQCPotentialVariant.on('click', this.qcPotentialVariant.bind(this));
            this.$buttonQCCertainVariant.on('click', this.qcCertainVariant.bind(this));
            this.$buttonShowRemoteFileModal.on('click', this.showRemoteFileModal.bind(this));
            
            //this.$buttonShowLoadJSONModal.on('click', this.showLoadJSONModal.bind(this));
            this.$buttonShowLoadRemoteFileModal.on('click', this.showLoadRemoteFileModal.bind(this));

            this.$buttonGoBatch.on('click', this.goBatch.bind(this));
            this.$modalSettings.on('hidden.bs.modal', this.hideSettingsModal.bind(this));
            this.$modalSettings.on('show.bs.modal', this.showSettingsModal.bind(this));
            this.$targetSettings.on('change', "#selectTierStyle", this.selectTierStyle.bind(this));
            this.$targetSettings.on('click', "#captureZoom", this.captureZoom.bind(this));
            this.$targetSettings.on('click', '#captureZoom', this.selectCustomZoom.bind(this));
            this.$targetSettings.on('focus', '#zoomLevelText', this.selectCustomZoom.bind(this));
            
            this.$buttonLoadRemoteFile.on('click', this.loadRemoteFile.bind(this));
            this.$formLoadURL.submit(function(event) {
                event.preventDefault();
                this.loadRemoteFile();
            }.bind(this));

            this.$fileLoadingFileListTarget.on('click', '.destroy', this.destroy.bind(this));

        },
        loadLocalFile: function() {
            console.log('here!!!!');
            console.log(this.$localFile);
            var files = this.$localFile[0].files;
            console.log(files);
            for (var i=0; i<files.length; i++) {
                var f = files[i],
                ext = utils.getExtension(f);

                if (this.mode === 'batch' && ext === 'json') {
                        var reader = new FileReader();
                        reader.readAsText(f);
                        reader.onload = function() {
                            this.parseJSON(JSON.parse(reader.result), f.name);
                        }.bind(this)
                }
            }
        },
        goBatch: function() {
            this.mode = 'batch';
            this.$sectionPickMode.hide()
            this.$sectionLoadFiles.show()
            this.$sectionLoadFiles.find('.title').html('Batch Mode');
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
            console.log('inside showRemoteFileModal');
            this.$serverLocation.html(this.settings.serverLocation);
            this.$modalLoadRemote.modal('show');
        },
        loadRemoteFile: function() {
            this.$modalLoadRemote.modal('hide');
            this.$fileLoadingErrorListTarget.html('');
            this.errors = [];

            var f = this.$remoteFilename.val(),
            ext = utils.getExtension(f);

            if (this.mode === 'batch' && ext !== 'json') {
                this.renderFileLoadingErrorList('Cannot load file of type <strong>' + ext + '</strong> in batch mode');
                return;
            }

            $.ajax({
                url: this.settings.serverLocation + f,
                xhrFields: { withCredentials: true }
            }).done(function(data) {
                console.log(data);  
                if (this.mode === 'batch') {
                    this.parseBatchFile(data);
                } else {
                    console.log('must be manual mode');
                }
            }.bind(this)).fail(function(jqXHR, textStatus) {
                this.renderFileLoadingErrorList('<strong>Error</strong>: Could not access file ' + f);
            }.bind(this));
        },
        renderFileLoadingErrorList: function(e) {
            if (typeof(this.errors) === 'undefined')
                this.errors = [];
            if (typeof(e) !== 'undefined')
                this.errors.push(e);
            this.$fileLoadingErrorListTarget.html(this.fileLoadingErrorListTemplate({errors:this.errors}));
        },
        parseBatchFile: function(text) {
        // First of all need to figure out what type of file it is.
        // Don't want to rely on file extensions. Attempt to treat as
        // JSON then if this fails assume to be tabular format.
            try {
                var contents = JSON.parse(text);
                this.parseJSON(contents);
            } catch (e) {
                console.log('argh not json');
                console.log(e);
                try {
                    this.parseTab(text);
                } catch (e) {
                    console.log('argh not tab file either');
                    console.log(e)
                }
            }
        },
        parseJSON: function(jso, filename) {
            // There are two different types of JSON formats (app see docs) so
            // need to figure out which one is being used.
            var sessions = jso["sessions"];
            console.log(filename);
            console.log(jso);
            
            var re_dna_location = /[chr]*[0-9,m,x,y]+[-:,\s]+\w+/i;

            // remove anything that may be loaded 
            variantFiles = [];
            bamFiles = [];
            baiFiles = [];
            for (var i=0; i<sessions.length; i++) {
                if (!sessions[i]['variants'] || !sessions[i]['bams']) {
                    this.renderFileLoadingErrorList('<strong>Error</strong>: ill-formed JSON in ' + filename + '. Check file syntax at <a href="http://jsonlint.com/">http://jsonlint.com/</a>');
                } else {
                    var s = new Session(),
                    v = sessions[i]["variants"];
                    var variantArray;
                    if (typeof(v) == 'string') {
                        if (v.match(re_dna_location)) {
                            // A single dna location
                            s.parseVariants(v);
                        } else {
                            // A file path
                            $.ajax({
                                url: this.settings.serverLocation + v,
                                xhrFields: { withCredentials: true }
                            }).done(function(fileText) {
                                //console.log(fileText);
                                s.parseVariants(fileText);
                            }).fail(function(jqXHR, textStatus) {
                                this.renderFileLoadingErrorList('<strong>Error</strong>: Could not access variant file ' + v);
                            }.bind(this));
                        }
                    } else if (typeof(v) == 'object') {
                        // An array of single dna locations
                        s.parseVariants(v);
                    } else {
                        console.log('Unrecognized variant list/file');
                        console.log(typeof(v));
                    }

                    //s.variantFile = new RemoteVariantFile(this.settings.serverLocation + );
                    for (var bi=0; bi<sessions[i]["bams"].length; bi++) {
                        var newBam = new RemoteBAM(this.settings.serverLocation + sessions[i]["bams"][bi]);
                        s.bamFiles.push(newBam);
                    }
                    this.sessions.addSession(s);
                }
            }
        },
        parseTab: function(text) {
            throw new UserException('InvalidTabFile');
        },
        showLoadJSONModal: function() {
            this.$serverLocation.html(this.settings.serverLocation);
            this.$modalLoadRemote.modal('show');
        },
        showLoadRemoteFileModal: function() {
            this.$serverLocation.html(this.settings.serverLocation);
            this.$modalLoadRemote.modal('show');
            //this.loadJSONFile2();
            //this.$modalLoadJSON.modal('hide');
        },
        renderFileList: function() {
            console.log(this.sessions);
            if (this.sessions.sessions.length > 0)
                this.$buttonLoadDalliance.show();
            else
                this.$buttonLoadDalliance.hide();
            this.$fileLoadingFileListTarget.html(this.fileLoadingFileListTemplate(this.sessions));
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

        },
        indexFromEl: function (el) {
            var ID = $(el).closest('.panel-session').data('id');
            console.log(ID);
            var sessions = this.sessions.sessions;
            var i = sessions.length;
            while (i--) {
                if (sessions[i].ID === ID) {
                    return i;
                }
            }
        },
        destroy: function(e) {
            console.log('Found the following id: ');
            var id = this.indexFromEl(e.target);
            console.log(id);
            this.sessions.sessions.splice(this.indexFromEl(e.target), 1);
            this.renderFileList();
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
        getNextID: function() {
            if (typeof(this.ID) == 'undefined')
                this.ID = 0
            else
                this.ID++;
            return this.ID;
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



function getName(f) {
    if (typeof(f) !== "string") {
        f = f.name;
    }
    var parts = f.split("/");
    return parts[parts.length - 1];
}
