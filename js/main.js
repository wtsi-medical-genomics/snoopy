var app = app || {},
utils = utils || {};

$(function() {
    "use strict";
    
    utils = {
        getExtension: function(f) {
            if (typeof(f) !== "string") {
                f = f.name;
            }
            var parts = f.split(".");
            return parts[parts.length - 1].toLowerCase();
        },
        getNextUID: function() {
            if (typeof(this.ID) == 'undefined')
                this.ID = 0
            else
                this.ID++;
            return this.ID;
        }
    }

    app = {
        init: function() {
            console.log('here');
            this.view = 'loadFiles';
            this.sessionIndex = 0;
            this.variantIndex = 0;
            this.sessions = new Sessions();
            this.zip = new JSZip();
            this.imageFolder = this.zip.folder('images');
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
                dallianceView: 'mismatch',
                colors: {
                    A: '#008000', 
                    C: '#0000FF', 
                    G: '#FFA500', 
                    T: '#FF0000', 
                    '-': '#FF69B4', 
                    I: '#800080'
                },
                styles: styleSheets,
                // styles: {
                //     raw: {
                //         colors: {
                //             A: 'green', 
                //             C: 'blue', 
                //             G: 'orange', 
                //             T: 'red',
                //             D : 'hotpink',
                //             I : 'red'
                //         },
                //         disableQuals: false,
                //         insertions: false
                //     },
                //     mismatch: {
                //         colors: {
                //             plus: '#FFEBD7',
                //             minus: '#BED8EA'
                //         },
                //         disableQuals: false,
                //         insertions: false
                //     },
                //     condensed: {
                //         colors: {
                //             matches: 'lightgrey',
                //             D: 'hotpink',
                //             I: 'red'
                //         },
                //         disableQuals: true
                //     },
                //     coverage: {
                //         threshold: 2,
                //         height: 120
                //     }
                // },
                qcEncoding: {
                    'not variant': 'not variant',
                    'uncertain': 'uncertain',
                    'variant': 'variant'
                },
                coverageThreshold: 0.2
            }
            //}

            this.referenceGenome = {
                name: 'Genome',
                twoBitURI: 'http://www.biodalliance.org/datasets/hg19.2bit',
                tier_type: 'sequence',
                provides_entrypoints: true,
                pinned: true
            };
        },

        cacheElements: function() {
            this.$app = $('#app');

            this.$localFile = this.$app.find('#fileLoaded');
            this.$buttonLoadDalliance = this.$app.find('#buttonLoadDalliance');
            this.$buttonRestart = this.$app.find('#buttonRestart');
            this.$buttonPrepareDownloadQCreport = this.$app.find('#buttonPrepareDownloadQCreport');
            this.$buttonDownloadQCreport = this.$app.find('#buttonDownloadQCreport');
            this.$buttonGoBack = this.$app.find('#buttonGoBack');
            this.$buttonHome = this.$app.find('#buttonHome');
            // this.$buttonQCNotVariant = this.$app.find('#buttonQCNotVariant');
            // this.$buttonQCPotentialVariant = this.$app.find('#buttonQCPotentialVariant');
            // this.$buttonQCCertainVariant = this.$app.find('#buttonQCCertainVariant');
            this.$buttonShowRemoteFileModal = this.$app.find('#buttonShowRemoteFileModal');
            this.$buttonLoadRemoteFile = this.$app.find('#buttonLoadRemoteFile');
            this.$buttonShowLoadRemoteFileModal = this.$app.find('#buttonShowLoadRemoteFileModal');
            this.$buttonLoadJSONFile = this.$app.find('#buttonLoadJSONFile');
            this.$modalDownloadQCreport = this.$app.find('#modalDownloadQCreport');
            this.$modalLoadRemote = this.$app.find('#modalLoadRemote');
            this.$modalSettings = this.$app.find('#modalSettings');
            //this.settingsTemplate = _.template($("#settingsTemplate").html());
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

            this.$modalVariantSelect = this.$app.find('#modalVariantSelect');
            this.variantSelectTemplate = _.template($("#variantSelectTemplate").html());
            this.$variantListTarget = this.$app.find('#variantListTarget');
            this.$qcDecision = this.$app.find('#qcDecision');

            //this.currentVariantTemplate = _.template($("#currentVariantTemplate").html());
            this.$currentVariantTarget = this.$app.find('#currentVariantTarget');
            this.$viewChoice = this.$app.find('.view-choice');

            // settings
            this.$settingsZoomLevelText = this.$app.find('#settingsZoomLevelText');
            this.$settingsServerLocation = this.$app.find('#settingsServerLocation');
            this.$settingsDefaultZoomLevel =this.$app.find('input:radio[name="defaultZoomLevel"]:checked');
            this.$settingsAutoZoom = this.$app.find('#settingsAutoZoom');
            this.$settingsDallianceView = this.$app.find('#selectTierStyle');
            this.$settingsA = this.$app.find('#settingsA');
            this.$settingsC = this.$app.find('#settingsC');
            this.$settingsG = this.$app.find('#settingsG');
            this.$settingsT = this.$app.find('#settingsT');
            this.$settingsI = this.$app.find('#settingsI');
            this.$settingsD = this.$app.find('#settingsD');
            this.$settingsRawShowInsertions = this.$app.find('#settingsRawShowInsertions');
            this.$settingsRawEnableQuals = this.$app.find('#settingsRawEnableQuals');
            this.$settingsMismatchPlusStrandColor = this.$app.find('#settingsMismatchPlusStrandColor');
            this.$settingsMismatchMinusStrandColor = this.$app.find('#settingsMismatchMinusStrandColor');
            this.$settingsMismatchShowInsertions = this.$app.find('#settingsMismatchShowInsertions');
            this.$settingsMismatchEnableQuals = this.$app.find('#settingsMismatchEnableQuals');
            this.$settingsCondensedMatchColor = this.$app.find('#settingsCondensedMatchColor');
            // this.$settingsCondensedD = this.$app.find('#settingsCondensedD');
            // this.$settingsCondensedI = this.$app.find('#settingsCondensedI');
            this.$settingsCondensedEnableQuals = this.$app.find('#settingsCondensedEnableQuals');
            this.$settingsCoverageThreshold = this.$app.find('#settingsCoverageThreshold');
            this.$settingsCoverageHeight = this.$app.find('#settingsCoverageHeight');

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
            this.$buttonHome.on('click', this.goHome.bind(this));
            
            // this.$buttonQCNotVariant.on('click', this.qcNotVariant.bind(this));
            // this.$buttonQCPotentialVariant.on('click', this.qcPotentialVariant.bind(this));
            // this.$buttonQCCertainVariant.on('click', this.qcCertainVariant.bind(this));
            this.$buttonShowRemoteFileModal.on('click', this.showRemoteFileModal.bind(this));
            this.$buttonShowLoadRemoteFileModal.on('click', this.showLoadRemoteFileModal.bind(this));

            this.$buttonGoManual.on('click', this.goManual.bind(this));
            this.$buttonGoBatch.on('click', this.goBatch.bind(this));
            this.$modalSettings.on('hidden.bs.modal', this.hideSettingsModal.bind(this));
            this.$modalSettings.on('show.bs.modal', this.showSettingsModal.bind(this));
            this.$targetSettings.on('change', "#selectTierStyle", this.selectTierStyle.bind(this));
            this.$targetSettings.on('click', "#captureZoom", this.captureZoom.bind(this));
            this.$targetSettings.on('click', '#captureZoom', this.selectCustomZoom.bind(this));
            this.$targetSettings.on('focus', '#settingsZoomLevelText', this.selectCustomZoom.bind(this));
            
            this.$buttonLoadRemoteFile.on('click', this.loadRemoteFile.bind(this));
            this.$formLoadURL.submit(function(event) {
                event.preventDefault();
                this.loadRemoteFile();
            }.bind(this));
            
            //this.$modalVariantSelect.on('show.bs.modal', this.showModalVariantSelect.bind(this));
            this.$fileLoadingFileListTarget.on('click', '.destroy', this.destroy.bind(this));
            this.$variantListTarget.on('click', this.variantSelected.bind(this));
            this.$qcDecision.on('click', this.setQC.bind(this));

            this.$viewChoice.on('click', this.changeView.bind(this));
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
        goManual: function () {
            this.mode = 'manual';
            this.$sectionPickMode.hide()
            this.$sectionLoadFiles.show()
            this.$sectionLoadFiles.find('.title').html('Manual Mode');
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
            // if (this.variantIndex > 0) {
            //    this.variantIndex--;
            //    this.renderVariantList();
            // } else if (this.sessionIndex > 0) {
            //     this.sessionIndex--;
            //     this.renderVariantList();
            // }
            this.sessions.prev();
        },
        goHome: function() {
            this.sessions.gotoCurrentVariant();
        },
        // qcNotVariant: function() {
        //     this.sessions.sessions[this.sessionIndex].variants[this.variantIndex] = 'not variant';
        //     this.nextVariant();
        // },
        // qcPotentialVariant: function() {
        //     this.sessions.setQC(0);
        // },
        // qcCertainVariant: function() {
        //     this.sessions.setQC(1);
        // },
        setQC: function(e) {
            var d = $(e.target).closest('.qc-decision').data('value');
            console.log(d)
            this.sessions.setQC(d)
            // this.sessions.sessions[this.sessionIndex].variants[this.variantIndex].score = d;

            // var s = this.sessions.sessions[this.sessionIndex];
            // if (this.variantIndex < s.variants.length - 1) {
            //     this.variantIndex++;
            //     //this.gotoCurrentVariant();
            // } else if (this.sessionIndex < this.sessions.sessions.length - 1) {
            //     this.sessionIndex++;
            //     this.variantIndex = 0;
            // }  else {
            //     console.log('finished');
            // }
            // this.renderVariantList();
        },
        nextVariant: function() {
            // var s = this.sessions.sessions[this.sessionIndex],
            // v = s.variants;
            // if s[this.sessionIndex + 1]
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
            var $settingsZoomLevelText = this.$targetSettings.find('#settingsZoomLevelText'),
                $zoomRadio = $('input:radio[name="defaultZoomLevel"]'),
                cz = Math.round(app.browser.viewEnd - app.browser.viewStart);

            $settingsZoomLevelText.val(cz);  
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
                        var newBam = new RemoteBAM(sessions[i]["bams"][bi]);
                        s.bamFiles.push(newBam);
                    }
                    this.sessions.sessions.push(s);
                }
            }
            this.renderFileList();
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
        renderVariantList: function(html) {
            console.log('inside renderVariantList and here is the html ' + html)
            this.$currentVariantTarget.html(html);
            this.$variantListTarget.html(this.variantSelectTemplate(this.sessions));
        },

        loadJSONFile2: function () {

        },
        indexFromEl: function (el, parent) {
            var ID = $(el).closest(parent).data('id');
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
            this.sessions.sessions.splice(this.indexFromEl(e.target, '.panel-session'), 1);
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
                this.sessions.sessions.push(s);
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
        changeView: function(e) {
            var v = $(e.target).data('value');
            app.settings.dallianceView = v;
            this.sessions.refreshStyles();
        },
        loadDalliance: function() {
            // Create and append select list
            // var myDiv = document.getElementById("variantSelectHolder");
            // var selectList = document.createElement("select");
            // selectList.id = "variantSelect";
            // selectList.className = "form-control";
            // selectList.onchange = function() {
            //     this.sessions.updateByVariantSelect();
            // }
            // myDiv.appendChild(selectList);

            // if (this.sessions.sessions.length === 0) {
            //     // create a single session from whatever is present in the file loader
            //     var s = new Session(bamFiles, variantFiles[0]);
            //     this.sessions.addSession(s);
            // } else {
            //     // a multi-session is already loaded
            // }
            //this.sessions.load(0);
            // setTimeout(function() {
            //     if (this.settings.defaultZoomLevelUnit) { 
            //         b.zoomStep(-1000000);
            //     } else {
            //         b.zoom(this.settings.currentZoom);
            //     }
            // }, 1000);
            $('.dalliance-view').css('display', 'block');
            $("#fileLoader").css("display", "none");
            $("#controlCenter, #progressBar").css("display", "block");
            $("#my-dalliance-holder").css("opacity", "1");
            this.view = 'dalliance'
            this.sessions.index = 0;
            //this.renderVariantList();

            this.browser = new Browser({
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
                noClearHighlightsButton: true,
                // sources: [
                //     this.referenceGenome
                // ],
                    //    setDocumentTitle: true,
                    //uiPrefix: 'file:///Users/dr9/Developer/snoopy/dalliance/',
                fullScreen: true,
            });
            this.browser.addInitListener(function() {
                this.sessions.init()
            }.bind(this));

            // this.browser.addViewListener(function(chr, min, max) {
            //     console.log(chr + ':' + min + '-' + max);
            //     if (this.settings.autoZoom) {
            //         if (this.settings.defaultZoomLevel === 'unit') { 
            //             this.browser.zoomStep(-1000000);
            //         } else {
            //             this.browser.zoom(this.settings.customZoom);
            //         }
            //     }
            // }.bind(this));
        },
        variantSelected: function(e) {
            this.$modalVariantSelect.modal('hide');
            console.log($(e.target));
            var variantIndex = $(e.target).closest('.list-group-item-variant')
            if (typeof(variantIndex) === 'undefined')
                variantIndex = 0;
            else
                variantIndex = variantIndex.data('id');
            var sessionIndex = $(e.target).closest('.list-group-session').data('id');
            console.log('sessionIndex ' + sessionIndex);
            console.log('variantIndex ' + variantIndex);

            this.sessions.goto(sessionIndex, variantIndex);
        },
        hideSettingsModal: function() {
            // Regardless of where the app is currently at, we can always set the serverLocation
            this.settings.serverLocation = this.$settingsServerLocation.val().trim();
            
            if (this.view === 'dalliance') {
                var customZoom = this.$settingsZoomLevelText.val().trim() | 0;
                customZoom /= this.browser.zoomBase  || 0; // browser may not exist at this point
                
                // User has not entered something sensible so assign something worthwhile
                if (customZoom < 0)
                    customZoom = Math.exp(b.zoomMin/b.zoomExpt);
                
                this.settings.defaultZoomLevel = $('input[name=defaultZoomLevel]:checked').val();
                this.settings.autoZoom = this.$settingsAutoZoom.prop('checked');
                this.settings.customZoom = customZoom;
                //this.settings.dallianceView = this.$settingsDallianceView.val();
                this.settings.colors = {
                    A: this.$settingsA.val(), 
                    C: this.$settingsC.val(), 
                    G: this.$settingsG.val(), 
                    T: this.$settingsT.val(),
                    '-': this.$settingsD.val(),
                    I: this.$settingsI.val()
                };

                this.settings.styles.raw.styles[2].style.__INSERTIONS = this.$settingsRawShowInsertions.prop('checked');
                this.settings.styles.raw.styles[2].style.__disableQuals = !this.$settingsRawEnableQuals.prop('checked');
                
                this.settings.styles.mismatch.styles[2].style._plusColor = this.$settingsMismatchPlusStrandColor.val();
                this.settings.styles.mismatch.styles[2].style._minusColor = this.$settingsMismatchMinusStrandColor.val();
                this.settings.styles.mismatch.styles[2].style.__INSERTIONS = this.$settingsMismatchShowInsertions.prop('checked');
                this.settings.styles.mismatch.styles[2].style.__disableQuals = !this.$settingsMismatchEnableQuals.prop('checked');
                
                // In this view both plus and minus strand are the same color but so only need to set one.
                this.settings.styles.condensed.styles[2].style._plusColor = this.$settingsCondensedMatchColor.val();
                this.settings.styles.condensed.styles[2].style._minusColor = this.$settingsCondensedMatchColor.val();
                console.log('here')
                this.settings.styles.condensed.styles[2].style.__disableQuals = !this.$settingsCondensedEnableQuals.prop('checked');
                
                this.settings.coverageThreshold = this.$settingsCoverageThreshold.val().trim();
                this.settings.styles.coverage.styles[2].style.HEIGHT = this.$settingsCoverageHeight.val().trim();
                this.sessions.refreshStyles();
            }
            

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
            // this.$targetSettings.html(this.settingsTemplate({
            //         settings: this.settings,
            //         zoomLevel: this.settings.customZoom * this.browser.zoomBase || 0,
            //         view: this.view
            //     }));

            //$("#zoomLevelText").val(b.zoomBase * this.settings.currentZoom);

            this.$settingsServerLocation.val(this.settings.serverLocation);
            // this.$settingsDefaultZoomLevel.val(this.settings.defaultZoomLevel);
            $('input[name=defaultZoomLevel][value=' + this.settings.defaultZoomLevel + ']').prop('checked', true);
            this.$settingsAutoZoom.prop('checked', this.settings.autoZoom);
            //this.$settingsDallianceView.val(this.settings.dallianceView);
            //this.$settingsZoomLevelText.val(this.settings.customZoom * this.browser.zoomBase || 0);
            
            // This needs to be taken out of the stylesheet and straight into settings.
            // TODO: amend index.html
            this.$settingsA.val(this.settings.colors.A);
            this.$settingsC.val(this.settings.colors.C);
            this.$settingsG.val(this.settings.colors.G);
            this.$settingsT.val(this.settings.colors.T);
            this.$settingsI.val(this.settings.colors.I);
            this.$settingsD.val(this.settings.colors['-']);

            this.$settingsRawShowInsertions.prop('checked', this.settings.styles.raw.styles[2].style.__INSERTIONS);
            this.$settingsRawEnableQuals.prop('checked', !this.settings.styles.raw.styles[2].style.__disableQuals);
            
            this.$settingsMismatchPlusStrandColor.val(this.settings.styles.mismatch.styles[2].style._plusColor);
            this.$settingsMismatchMinusStrandColor.val(this.settings.styles.mismatch.styles[2].style._minusColor);
            this.$settingsMismatchShowInsertions.prop('checked', this.settings.styles.mismatch.styles[2].style.__INSERTIONS);
            this.$settingsMismatchEnableQuals.prop('checked', !this.settings.styles.mismatch.styles[2].style.__disableQuals);
            
            // In this view both plus and minus strand are the same color but so only need to set one.
            this.$settingsCondensedMatchColor.val(this.settings.styles.condensed.styles[2].style._plusColor);
            // These are set straight in the settings rather than in a stylesheet.
            // this.$settingsCondensedD.val(this.settings.styles.condensed.colors.D);
            // this.$settingsCondensedI.val(this.settings.styles.condensed.colors.I);
            this.$settingsCondensedEnableQuals.prop('checked', !this.settings.styles.condensed.styles[2].style.__disableQuals);
            
            // NEXT
            this.$settingsCoverageThreshold.val(this.settings.coverageThreshold);
            this.$settingsCoverageHeight.val(this.settings.styles.coverage.styles[2].style.HEIGHT);
            
                    // qcEncoding: {
                    //     'not variant': 'not variant',
                    //     'uncertain': 'uncertain',
                    //     'variant': 'variant'
                    // }

            // defaultZoomLevel: 'unit',
            // autoZoom: true,
            // customZoom: false,
            // dallianceView: 'mismatch',
            // plusColor: '#FFEBD7',
            // minusColor: '#BED8EA',
            //$("#captureZoom").click(function() {
            //    $("#defaultZoomLevelCurrent").prop("checked", true);
             //   var cz = Math.round(b.viewEnd - b.viewStart);
              //  $("#zoomLevelText").val(cz);
            //});
        }
    }
    app.init();
});





//b.zoomMin = 20;

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
