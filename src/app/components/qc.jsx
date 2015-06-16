var React = require('react');
var rb = require('react-bootstrap');
var Alert = rb.Alert;
var Panel = rb.Panel;
var Nav = rb.Nav;
var Navbar = rb.Navbar;
var NavItem = rb.NavItem;
var MenuItem = rb.MenuItem;
var DropdownButton = rb.DropdownButton;
var Col = rb.Col;
var Row = rb.Row;
var Grid = rb.Grid;
var Button = rb.Button;
var Input = rb.Input;
var Glyphicon = rb.Glyphicon;
var ModalTrigger = rb.ModalTrigger;
var Modal = rb.Modal;

var SessionsModal = require('./sessionsmodal.jsx');
var JSZip = require('JSZip');
var saveAs = require('filesaver.js');

var browser;
var zip = new JSZip();
var imageFolder = zip.folder('images');


var QC = React.createClass({

  componentDidMount() {
    browser = new Browser({
      chr:          '16',
      viewStart:    48000181,
      viewEnd:      48000381,
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
      singleBaseHighlight : false,
      defaultHighlightFill : 'grey',
      defaultHighlightAlpha : 0.10,
      noTrackAdder : false,
      noLeapButtons : true,
      noLocationField : false,
      noZoomSlider : false,
      noTitle : false,
      noTrackEditor : false,
      noExport : false,
      noOptions : false,
      noHelp : true,
      noPersistView : true,
      noClearHighlightsButton: true,
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
      })
      browser.addInitListener(() => {
        // this.index = 0;
        // this.props.sessions[this.index].index = 0;
        // this.sessions[this.state.sessionIndex].browser = this.browser;
        
        var style = this.props.settings.getIn(['styles','condensed','styles']);
        this.props.sessions.init(browser, style);
        this.props.sessions.gotoCurrentVariant(browser);

        // this.props.sessions.sessions[0].getTier()
        // var loc = this.props.sessions.sessions[0].variants[0].getLocation();
        // var hlr = this.props.sessions.sessions[0].variants[0].getHighlightRegion();
        // browser.highlightRegion(loc.chr, loc.min, loc.max);
        // browser.setCenterLocation(hlr.chr, hlr.min, hlr.max);



    });
    // this.props.sessions.init();
    

  },

  shouldComponentUpdate(nextProps, nextState) {
    console.log('in shouldComponentUpdate');
    return true;
  },

  render() {
    return (
      <div>
        <QCToolbar sessions={this.props.sessions} settings={this.props.settings} view='condensed' />
        <DallianceHolder />
      </div>
    );
  }

});


var DallianceHolder = React.createClass({

  render() {
    var style = {
      backgroundColor: 'white',
      border: '6px solid grey'
    }
    return (
        <div id="svgHolder" style={style}></div>
    );
  }

});

var QCToolbar = React.createClass({
  
  shouldComponentUpdate(nextProps, nextState) {
    console.log('in qc shouldComponentUpdate');
    return true;
  },

  getInitialState() {
    return {
      currentVariant: this.props.sessions.getCurrentVariant(),
      view: this.props.view,
      numSnapshots: 0,
      numVariantsReviewed: 0
    };
  },

  nextVariant() {
    var nv = this.props.sessions.next(browser);
    this.setState({currentVariant: nv.variant});
    if (nv.done) {
      var content = zip.generate({type:"blob"});
      saveAs(content, "results.zip");
    }
  },

  handleVariantList(e) {
    e.preventDefault();
    // var score = settings.score.variant;
    var score = 'variant';
    this.props.sessions.setQC(score);
    this.nextVariant();
  },

  handleHome(e) {
    e.preventDefault();
    this.props.sessions.gotoCurrentVariant(browser);
  },

  handlePrevious(e) {
    e.preventDefault();
    // var score = settings.score.variant;
    var previousVariant = this.props.sessions.previous(browser);
    if (previousVariant) {
      this.setState({currentVariant: previousVariant});
    } else {
      console.log('already at the beginning');
    }
  },

  handleQC(decision, e) {
    e.preventDefault();
    this.props.sessions.setQC(decision);
    var nvr = this.props.sessions.getNumVariantsReviewed();
    this.setState({numVariantsReviewed: nvr});
    this.nextVariant();
  },

  handleVariantSelect(si, vi) {
    var nv = this.props.sessions.goto(browser, si, vi, this.state.style);
    this.setState({currentVariant: nv});
  },

  handleSnapshot() {
    var imgdata = browser.exportImage();
    imgdata = imgdata.split(',');
    if (imgdata.length === 2) {
        var screenshot = imgdata[1];
        var imgName = this.props.sessions.stringCurrentSession();
        imageFolder.file(imgName + '.png', screenshot, {base64: true});
        var ns =  Object.keys(imageFolder.files).length - 1;
        this.setState({numSnapshots: ns});
    } else {
        console.log('more than two parts to the image');
    }
  },

  handleView(view) {
    var style = this.props.settings.getIn(['styles',view,'styles']);
    this.setState({view: view});
  },

  handleDownloadQC(qcDecisionFilename, snapshotFilename) {
    console.log('qcDecisionFilename', qcDecisionFilename);
    console.log('snapshotFilename', snapshotFilename);
    if (qcDecisionFilename)
      this.handleSaveQC(qcDecisionFilename);
    if (snapshotFilename)
      this.handleSaveSnapshots(snapshotFilename);
  },

  handleSaveQC(qcDecisionFilename) {
    var results = this.props.sessions.generateQCreport();
    var blob = new Blob([results], {type: 'text/plain;charset=utf-8'});
    saveAs(blob, qcDecisionFilename + '.txt');
  },

  handleSaveSnapshots(snapshotFilename) {
    var content = zip.generate({type:'blob'});
    saveAs(content, snapshotFilename + '.zip');
  },

  render() {
    if (browser && this.props.sessions.style !== this.props.settings.getIn(['styles',this.state.view,'styles'])) {
      this.props.sessions.updateStyle(browser, this.props.settings.getIn(['styles',this.state.view]));
    }

    var scoreBadge
    switch (this.state.currentVariant.score) {
      case 'variant':
        scoreBadge = (<span className="badge green qc-badge">&#x2713;</span>);
        break;
      case 'uncertain':
        scoreBadge = (<span className="badge amber qc-badge">?</span>);
        break;
      case 'not variant':
        scoreBadge = (<span className="badge red qc-badge">x</span>);
        break;
    }
    return (
      <Navbar toggleNavKey={0} className='QCToolbar'>
        <Nav navbar>
          <ModalTrigger modal={
            <SessionsModal sessions={this.props.sessions} handleVariantSelect={this.handleVariantSelect}/>
          }>
            <NavItem eventKey={1} href='#'>
              <Button>
                {this.state.currentVariant.locationString()} &nbsp; {scoreBadge}
              </Button>
            </NavItem>
          </ModalTrigger>
          <NavItem eventKey={2} href='#' onClick={this.handleHome}><Button><Glyphicon glyph='home' /></Button></NavItem>
          <NavItem eventKey={3} href='#' onClick={this.handlePrevious}><Button><Glyphicon glyph="chevron-left"/>Previous</Button></NavItem>
          <NavItem eventKey={4} href='#' onClick={this.handleQC.bind(this, 'not variant')}><Button>Not a Variant<Glyphicon glyph="chevron-right"/></Button></NavItem>
          <NavItem eventKey={5} href='#' onClick={this.handleQC.bind(this, 'uncertain')}><Button>Uncertain<Glyphicon glyph="chevron-right"/></Button></NavItem>
          <NavItem eventKey={6} href='#' onClick={this.handleQC.bind(this, 'variant')}><Button>Variant<Glyphicon glyph="chevron-right"/></Button></NavItem>
          <NavItem eventKey={7} href='#' onClick={this.handleSnapshot}><Button><Glyphicon glyph="camera"/></Button></NavItem>
          <DropdownButton eventKey={9} title={<Button><Glyphicon glyph="eye-open"/></Button>}>
            <MenuItem eventKey={1} onSelect={this.handleView.bind(this, 'raw')}>Raw</MenuItem>
            <MenuItem eventKey={2} onSelect={this.handleView.bind(this, 'condensed')}>Condensed</MenuItem>
            <MenuItem eventKey={3} onSelect={this.handleView.bind(this, 'mismatch')}>Mismatch</MenuItem>
            <MenuItem eventKey={4} onSelect={this.handleView.bind(this, 'coverage')}>Coverage</MenuItem>
          </DropdownButton>
        </Nav>
        <Nav navbar right>                
          <SaveModalTrigger eventKey={2} numVariantsReviewed={this.state.numVariantsReviewed} numSnapshots={this.state.numSnapshots} handleDownloadQC={this.handleDownloadQC} handleRestart={this.handleRestart} />
          <ExitModalTrigger eventKey={3} numVariantsReviewed={this.state.numVariantsReviewed} numSnapshots={this.state.numSnapshots} handleDownloadQC={this.handleDownloadQC} handleRestart={this.handleRestart} />
        </Nav>
      </Navbar>
    );    
  }
                    // <button type="button" class="btn btn-default qc-decision" id="buttonQCNotVariant" data-value="not variant">Not a Variant <span class="glyphicon glyphicon-chevron-right"></span></button>
                    // <button type="button" class="btn btn-default qc-decision" id="buttonQCPotentialVariant" data-value="uncertain">Uncertain <span class="glyphicon glyphicon-chevron-right"></span></button>
                    // <button type="button" class="btn btn-default qc-decision" id="buttonQCCertainVariant"  data-value="variant">Variant <span class="glyphicon glyphicon-chevron-right"></span></button>
});


var SaveModalTrigger = React.createClass({
  render() {
    // numVariantsReviewed={this.props.sessions.getNumVariantsReviewed()}
    // numSnapshots={Object.keys(imageFolder.files).length-1}
    
    // mixins: [OverlayMixin]

    return (
      <ModalTrigger modal={<ExitModal 
                              handleRestart={this.props.handleRestart}
                              numVariantsReviewed={this.props.numVariantsReviewed}
                              numSnapshots={this.props.numSnapshots}
                              handleDownloadQC={this.props.handleDownloadQC} 
                              view='save' />
                          }>
        <NavItem eventKey={this.props.eventKey} href='#'>
          <Button><Glyphicon glyph="save-file"/></Button>
        </NavItem>
      </ModalTrigger>
    );
  }

});

var ExitModalTrigger = React.createClass({
  render() {
    // numVariantsReviewed={this.props.sessions.getNumVariantsReviewed()}
    // numSnapshots={Object.keys(imageFolder.files).length-1}
    return (
      <ModalTrigger modal={<ExitModal 
                              handleRestart={this.props.handleRestart}
                              numVariantsReviewed={this.props.numVariantsReviewed}
                              numSnapshots={this.props.numSnapshots}
                              handleDownloadQC={this.props.handleDownloadQC} 
                              view='exit' />
                          }>
        <NavItem eventKey={this.props.eventKey} href='#'>
          <Button><Glyphicon glyph="eject"/></Button>
        </NavItem>
      </ModalTrigger>
    );
  }
});

var ExitModal = React.createClass({

  getInitialState() {
    return {view: this.props.view}
  },

  handleRestart() {
    document.location.reload();
  },

  handleSave() {
    this.setState({view: 'save'});
  },

  handleDownloadQC() {
    console.log('handleDownloadQC');
    var qcDecisionFilename = this.refs.QCDecisionFilename.getValue().trim();
    var snapshotFilename = this.refs.screenshotsFilename.getValue().trim();
    var saveQCDecisions = this.refs.saveQCDecisions.getChecked();
    var saveScreenshots = this.refs.saveScreenshots.getChecked();

    var qc = false;
    var snapshots = false;

    if (saveQCDecisions && qcDecisionFilename !== '')
        qc = qcDecisionFilename;
    if (saveScreenshots && snapshotFilename !== '')
        snapshots = snapshotFilename;
    
    this.props.handleDownloadQC(qc, snapshots);
    this.props.onRequestHide();
  },

  render() {

    if (this.state.view === 'save') {
      var title = 'Save Results';
      var QCDecisionNode = (<Input type="text" ref="QCDecisionFilename" placeholder="filename" addonAfter=".json"/>);
      var SnapshotNode = (<Input type="text" ref="screenshotsFilename" placeholder="zip archive name" addonAfter=".zip"/>);
      var body = (
        <form>
          <h4>{this.props.numVariantsReviewed} QC decisions made - save these?</h4>
          <Input type="checkbox"
            ref="saveQCDecisions"
            label={QCDecisionNode}
            defaultChecked={true} />
          <h4>{this.props.numSnapshots} snapshots taken - save these?</h4>
          <Input type="checkbox"
            ref="saveScreenshots"
            label={SnapshotNode}
            defaultChecked={true} />
        </form>
      );
      var footer = (
          <div>
            <Button bsStyle='primary' onClick={this.handleDownloadQC}>Save Current and Restart</Button>
            <Button bsStyle='primary' onClick={this.props.onRequestHide}>Cancel</Button>
          </div>
        );
    } else {
      var title = 'Restart';
      var body = (<div>What do you want to do with your current QC results?</div>);
      var footer = (
          <div>
            <Button bsStyle='primary' onClick={this.handleRestart}>Discard and Restart</Button>
            <Button bsStyle='primary' onClick={this.handleSave}>Save Current and Restart</Button>
            <Button bsStyle='primary' onClick={this.props.onRequestHide}>Cancel</Button>
          </div>
        );
    }

    return (
      <Modal {...this.props} title={title} animation={false}>
        <div className='modal-body'>
          {body}
        </div>
        <div className='modal-footer'>
          {footer}
        </div>
      </Modal>
    );
  }
});




module.exports = QC;