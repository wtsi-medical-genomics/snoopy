"use strict";

// import React from 'react';
// import {
//   Nav,
//   Navbar,
//   NavItem,
//   MenuItem,
//   DropdownButton,
//   Button,
//   Input,
//   Glyphicon,
//   Modal,
// } from 'react-bootstrap';
// import SessionsModal from './sessionsmodal.jsx';
// import JSZip from 'JSZip';
// import saveAs from 'filesaver.js';

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
var Modal = rb.Modal;

var SessionsModal = require('./sessionsmodal.jsx');
var saveAs = require('filesaver.js');

var browser;

function getDallianceZoomLevel() {
  if (browser)
  return Math.round(browser.viewEnd - browser.viewStart);
}

function getDallianceZoomBase() {
  if (browser)
    return browser.zoomBase;
}

const QC = React.createClass({

  componentDidMount() {
    console.log('i made it to here');
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
      baseColors: this.props.settings.getIn(['colors']).toJS(),
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
        console.log('this.props.sessions', this.props.sessions);
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
      numVariantsReviewed: 0,
      showSessionsModal: false,
      showSaveModal: false,
      showExitModal: false,
      showFinishedModal: false,
    };
  },

  nextVariant() {
    if(this.props.settings.get('snapshots')) {
      this.props.sessions.gotoCurrentVariant(browser, () => {
          this.handleSnapshot();
      });
    }
    var nv = this.props.sessions.next(browser)
    this.setState({currentVariant: nv.variant});
    if (nv.done) {
      this.setState({ showFinishedModal: true });
    }
    if (this.props.settings.get('defaultZoomLevel') === 'unit')
      browser.zoomStep(-1000000);
    else
      browser.zoom(this.props.settings.get('defaultZoomLevel'));
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
    console.log(this.props.sessions.getNumSnapshots());
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
    console.log(browser);
    this.props.sessions.takeSnapshot(browser);
    // var imgdata = browser.exportImage();
    // imgdata = imgdata.split(',');
    // if (imgdata.length === 2) {
    //     var screenshot = imgdata[1];
    //     var imgName = this.props.sessions.stringCurrentSession();
    //     imageFolder.file(imgName + '.png', screenshot, {base64: true});
    //     let ns =  Object.keys(imageFolder.files).length - 1;
    //     this.setState({numSnapshots: ns});
    // } else {
    //     console.log('more than two parts to the image');
    // }
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
    let results = this.props.sessions.generateQCreport();
    let blob = new Blob([results], {type: 'text/plain;charset=utf-8'});
    saveAs(blob, qcDecisionFilename + '.json');
  },

  handleSaveSnapshots(snapshotFilename) {
    // let content = zip.generate({type:'blob'});
    let content = this.props.sessions.getSnasphots()
    console.log(content);
    saveAs(content, snapshotFilename + '.zip');
  },

  openSessionsModal() {
    this.setState({ showSessionsModal: true });
  },

  closeSessionsModal() {
    this.setState({ showSessionsModal: false });
  },

  openSave() {
    this.setState({ showSaveModal: true });
  },

  closeSave() {
    this.setState({
      showSaveModal: false,
      finished: false,
    });
  },

  openExit() {
    this.setState({ showExitModal: true });
  },

  closeExit() {
    this.setState({ showExitModal: false });
  },

  openFinished() {
    this.setState({ showFinishedModal: true });
  },

  closeFinished() {
    this.setState({ showFinishedModal: false });
  },

  render() {

    if (browser &&
        browser.baseColors !== this.props.settings.getIn(['colors'])) {
      browser.baseColors = this.props.settings.getIn(['colors']).toJS();
    }

    if (browser && 
        this.props.sessions.style !== this.props.settings.getIn(['styles',this.state.view,'styles'])) {
      this.props.sessions.updateStyle(browser, this.props.settings.getIn(['styles',this.state.view]));
    }

    let scoreBadge;
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

    if (!this.props.settings.get('snapshots')) {
      var snapshotButton = (<NavItem eventKey={7} href='#' onClick={this.handleSnapshot}><Button><Glyphicon glyph="camera"/></Button></NavItem>);
    }

    return (
      <div>
        <Navbar toggleNavKey={0} className='QCToolbar'>
          <Nav navbar>
            <NavItem eventKey={1} href='#' onClick={this.openSessionsModal}><Button>{this.state.currentVariant.locationString()} &nbsp; {scoreBadge}</Button></NavItem>
            <NavItem eventKey={2} href='#' onClick={this.handleHome}><Button><Glyphicon glyph='home' /></Button></NavItem>
            <NavItem eventKey={3} href='#' onClick={this.handlePrevious}><Button><Glyphicon glyph="chevron-left"/>Previous</Button></NavItem>
            <NavItem eventKey={4} href='#' onClick={this.handleQC.bind(this, 'not variant')}><Button>Not a Variant<Glyphicon glyph="chevron-right"/></Button></NavItem>
            <NavItem eventKey={5} href='#' onClick={this.handleQC.bind(this, 'uncertain')}><Button>Uncertain<Glyphicon glyph="chevron-right"/></Button></NavItem>
            <NavItem eventKey={6} href='#' onClick={this.handleQC.bind(this, 'variant')}><Button>Variant<Glyphicon glyph="chevron-right"/></Button></NavItem>
            {snapshotButton}
            <DropdownButton eventKey={9} title={<Button><Glyphicon glyph="eye-open"/></Button>}>
              <MenuItem eventKey={1} onSelect={this.handleView.bind(this, 'raw')}>Raw</MenuItem>
              <MenuItem eventKey={2} onSelect={this.handleView.bind(this, 'condensed')}>Condensed</MenuItem>
              <MenuItem eventKey={3} onSelect={this.handleView.bind(this, 'mismatch')}>Mismatch</MenuItem>
              <MenuItem eventKey={4} onSelect={this.handleView.bind(this, 'coverage')}>Coverage</MenuItem>
            </DropdownButton>
          </Nav>
          <Nav navbar right>
            <NavItem eventKey={this.props.eventKey} href='#' onClick={this.openSave}><Button><Glyphicon glyph="save-file"/></Button></NavItem>
            <NavItem eventKey={this.props.eventKey} href='#' onClick={this.openExit}><Button><Glyphicon glyph="eject"/></Button></NavItem>
          </Nav>
        </Navbar>
        <SessionsModal
          sessions={this.props.sessions}
          handleVariantSelect={this.handleVariantSelect}
          close={this.closeSessionsModal}
          show={this.state.showSessionsModal}
        />
        <ExitModal
          numVariantsReviewed={this.state.numVariantsReviewed}
          numSnapshots={this.props.sessions.getNumSnapshots()}
          handleDownloadQC={this.handleDownloadQC}
          close={this.closeExit}
          show={this.state.showExitModal}
        />
        <SaveModal
          numVariantsReviewed={this.state.numVariantsReviewed}
          numSnapshots={this.props.sessions.getNumSnapshots()}
          handleDownloadQC={this.handleDownloadQC}
          close={this.closeSave}
          show={this.state.showSaveModal}
        />
        <FinishedModal
          numVariantsReviewed={this.state.numVariantsReviewed}
          numSnapshots={this.props.sessions.getNumSnapshots()}
          handleDownloadQC={this.handleDownloadQC}
          close={this.closeFinished}
          show={this.state.showFinishedModal}
        />
      </div>
    );    
  }
});


// var SaveModalTrigger = React.createClass({
//   render() {
//     return (
//       <ModalTrigger modal={<ExitModal 
//                               handleRestart={this.props.handleRestart}
//                               numVariantsReviewed={this.props.numVariantsReviewed}
//                               numSnapshots={this.props.numSnapshots}
//                               handleDownloadQC={this.props.handleDownloadQC} 
//                               view='save' />
//                           }>
//         <NavItem eventKey={this.props.eventKey} href='#'>
//           <Button><Glyphicon glyph="save-file"/></Button>
//         </NavItem>
//       </ModalTrigger>
//     );
//   }

// });

// var ExitModalTrigger = React.createClass({
//   render() {
//     // numVariantsReviewed={this.props.sessions.getNumVariantsReviewed()}
//     // numSnapshots={Object.keys(imageFolder.files).length-1}
//     return (
//       <ModalTrigger modal={<ExitModal 
//                               handleRestart={this.props.handleRestart}
//                               numVariantsReviewed={this.props.numVariantsReviewed}
//                               numSnapshots={this.props.numSnapshots}
//                               handleDownloadQC={this.props.handleDownloadQC} 
//                               view='exit' />
//                           }>
//         <NavItem eventKey={this.props.eventKey} href='#'>
//           <Button><Glyphicon glyph="eject"/></Button>
//         </NavItem>
//       </ModalTrigger>
//     );
//   }
// });

const SaveForm = React.createClass({
  handleInputChange() {
    let qcDecisionsFilename = this.refs.QCDecisionsFilename.getValue().trim();
    let screenshotsFilename = this.refs.screenshotsFilename.getValue().trim();
    let saveQCDecisions = this.refs.saveQCDecisions.getChecked();
    let saveScreenshots = this.refs.saveScreenshots.getChecked();
    let qc = saveQCDecisions && qcDecisionsFilename ? qcDecisionsFilename : false;
    let snapshots = saveScreenshots && screenshotsFilename ? screenshotsFilename : false;
    this.props.handleInputChange(qc, snapshots);
  },

  render() {
    let variantsDisable = this.props.numVariantsReviewed === 0;
    let snapshotsDisable = this.props.numSnapshots === 0;

    let QCDecisionNode = (
      <Input
        type="text"
        ref="QCDecisionsFilename"
        placeholder="filename"
        addonAfter=".json"
        onChange={this.handleInputChange}
        disabled={variantsDisable}
      />);
    let SnapshotNode = (
      <Input
        type="text"
        ref="screenshotsFilename"
        placeholder="zip archive name"
        addonAfter=".zip"
        onChange={this.handleInputChange}
        disabled={snapshotsDisable}
      />);
    return (
      <form>
        <h4>{this.props.numVariantsReviewed} QC decisions made - save these?</h4>
        <Input type="checkbox"
          ref="saveQCDecisions"
          label={QCDecisionNode}
          defaultChecked={!variantsDisable}
          onChange={this.handleInputChange}
          disabled={variantsDisable}
        />
        <h4>{this.props.numSnapshots} snapshots taken - save these?</h4>
        <Input type="checkbox"
          ref="saveScreenshots"
          label={SnapshotNode}
          defaultChecked={!snapshotsDisable}
          onChange={this.handleInputChange}
          disabled={snapshotsDisable}
        />
      </form>
    );
  }
});


const ExitModal = React.createClass({

  getInitialState() {
    return {
      qc: false,
      snapshots: false,
    };
  },

  handleSaveData(qc, snapshots) {
    this.setState({
      qc: qc,
      snapshots: snapshots,
    });
  },

  handleClose() {
    this.props.close();
  },

  handleSave() {
    this.props.handleDownloadQC(this.state.qc, this.state.snapshots);
  },

  handleRestart() {
    document.location.reload();
  },

  styles: {
    centerButton: {
      textAlign: 'center' 
    }
  },

  render() {
    return (
      <Modal show={this.props.show} onHide={this.handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Restart</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Do you want to save your QC decisions before you restart?
          <SaveForm
            numVariantsReviewed={this.props.numVariantsReviewed}
            numSnapshots={this.props.numSnapshots}
            handleInputChange={this.handleSaveData}
          />
          <div className='text-center'>
            <Button
              bsStyle='info'
              onClick={this.handleSave}
            >
             Save QC Decisions
            </Button>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle='primary' onClick={this.handleRestart}>Restart</Button>
          <Button bsStyle='primary' onClick={this.handleClose}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    );
  }
});


const SaveModal = React.createClass({

  getInitialState() {
    return {
      qc: false,
      snapshots: false,
    };
  },

  handleSaveData(qc, snapshots) {
    this.setState({
      qc: qc,
      snapshots: snapshots,
    });
  },

  handleClose() {
    this.props.close();
  },

  handleSave() {
    this.props.handleDownloadQC(this.state.qc, this.state.snapshots);
    this.handleClose();
  },

  render() {
    return (
      <Modal show={this.props.show} onHide={this.handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Save Results</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <SaveForm
            numVariantsReviewed={this.props.numVariantsReviewed}
            numSnapshots={this.props.numSnapshots}
            handleInputChange={this.handleSaveData}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle='primary' onClick={this.handleSave}>Save</Button>
          <Button bsStyle='primary' onClick={this.handleClose}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    );
  }
});


const FinishedModal = React.createClass({

  getInitialState() {
    return {
      qc: false,
      snapshots: false,
    };
  },

  handleSaveData(qc, snapshots) {
    this.setState({
      qc: qc,
      snapshots: snapshots,
    });
  },

  handleClose() {
    this.props.close();
  },

  handleSave() {
    this.props.handleDownloadQC(this.state.qc, this.state.snapshots);
    this.handleClose();
  },

  handleRestart() {
    document.location.reload();
  },

  render() {
    return (
      <Modal show={this.props.show} onHide={this.handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Save Results</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4 className="loose-bottom">
            <Alert bsStyle='success'>
              You have reached the last variant, would you like to save the results?
            </Alert>
          </h4>
          <SaveForm
            numVariantsReviewed={this.props.numVariantsReviewed}
            numSnapshots={this.props.numSnapshots}
            handleInputChange={this.handleSaveData}
          />
          <div className='text-center'>
            <Button
              bsStyle='info'
              onClick={this.handleSave}
            >
             Save QC Decisions
            </Button>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle='primary' onClick={this.handleRestart}>Discard and restart Snoopy</Button>
          <Button bsStyle='primary' onClick={this.handleClose}>Keep reviewing current session(s)</Button>
        </Modal.Footer>
      </Modal>
    );
  }
});


export default QC;
export { getDallianceZoomLevel, getDallianceZoomBase }
