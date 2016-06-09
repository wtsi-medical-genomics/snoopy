"use strict";

// import React from 'react';
// import { Alert, Panel, Col, Row, Grid, Button, Glyphicon, Pager, PageItem, ModalTrigger, ListGroup, ListGroupItem, Popover, Tooltip, Modal, OverlayTrigger } from 'react-bootstrap';
// import { FileLoader } from './fileloader.jsx';
// import { Session, Sessions } from '../session.js';
// import { LocalBAM, LocalBAI, RemoteBAM, RemoteBAI } from '../loadedfiletypes.js';
// import { getURL, getName } from '../utils.js';

import React from 'react';
import {
  Alert,
  Panel,
  Col,
  Row,
  Grid,
  Button,
  Glyphicon,
  Pager,
  PageItem,
  ListGroup,
  ListGroupItem,
  Popover,
  Tooltip,
  Modal, 
  OverlayTrigger
} from 'react-bootstrap';
import FileLoader from './fileloader.jsx';
import Session from '../session.js';
import Sessions from '../sessions.js';
import { LocalBAM, 
  LocalBAI, 
  RemoteBAM, 
  RemoteBAI,
} from '../loadedfiletypes.js';
import { getURL, getName, deepExtend } from '../utils.js';
import { List, Map } from 'immutable';
import Loader from 'react-loader';

// let session = new Session();
// var React = require('react');

// var rb = require('react-bootstrap');
// var Alert = rb.Alert;
// var Panel = rb.Panel;
// var Col = rb.Col;
// var Row = rb.Row;
// var Grid = rb.Grid;
// var Button = rb.Button;
// var Glyphicon = rb.Glyphicon;
// var Pager = rb.Pager;
// var PageItem = rb.PageItem;
// var ListGroup = rb.ListGroup;
// var ListGroupItem = rb.ListGroupItem;

// var FileLoader = require('./fileloader.jsx');

// var session = require('../session.js');
// var Session = session.Session;
// var Sessions = session.Sessions;

// var lft = require('../loadedfiletypes.js');
// var LocalBAM = lft.LocalBAM;
// var LocalBAI = lft.LocalBAI;
// var RemoteBAM = lft.RemoteBAM;
// var RemoteBAI = lft.RemoteBAI;

// var utils = require('../utils.js');
// var getName = utils.getName;
// var getURL = utils.getURL;

const LOADER_OPTIONS = {
  lines: 13,
  length: 5,
  width: 3,
  radius: 6,
  corners: 1,
  rotate: 0,
  direction: 1,
  color: '#000',
  speed: 1,
  trail: 60,
  shadow: false,
  hwaccel: false,
  zIndex: 2e9,
  top: '50%',
  left: '50%',
  scale: 1.00
};

// const FixMissingIndexModal = React.createClass({

//   close() {
//     this.props.close();
//   },

//   getInitialState() {
//     return { showModal: false };
//   },

//   render() {
//     return (
//       <Modal show={this.props.show} onHide={this.close} className="Settings">
//         <Modal.Header closeButton>
//           <Modal.Title>Missing index files</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           The following files are missing their index files. Please load the index file or remove the sequence file.
//         </Modal.Body>
//         <Modal.Footer>
//           <Button bsStyle="primary" onClick={this.close}>OK</Button>
//         </Modal.Footer>
//       </Modal>
//     );
//   }

// });


const TitlePanel = React.createClass({

  render: function() {
    return (
      <Panel>
        <h4>Manual Mode</h4>
      </Panel>
    );
  }

});

const LoadVariantsPanel = React.createClass({
  getInitialState(){
    return { showFileLoader: false };
  },

  handleFileLoad(file, connection) {
    console.log(typeof(file));
    this.props.handleVariantFile(file, connection);
    this.closeFileLoader();
  },

  openFileLoader() {
    this.setState({ showFileLoader: true });
  },

  closeFileLoader() {
    this.setState({ showFileLoader: false });
  },

  render: function() {
    
    let loadNode;
    if (this.props.loading) {
      let child;
      if (this.props.error) {
        child = (
          <Alert bsStyle='danger' className='someTopMargin'>
            {this.props.error}
          </Alert>
        );
      }
      loadNode = (
        <Loader loaded={this.props.loaded} options={LOADER_OPTIONS}>
          {child}
        </Loader>
      );
    }

    let tableStyle = {
      'width': '100%'
    };


    let variantNode;
    if (this.props.session.variants.length && this.props.session.variantFile) {
      variantNode = (
        <ListGroup className='someTopMargin'>
          <ListGroupItem bsStyle='success'>
            <table style={tableStyle}>
              <tr>
                <td><b>{this.props.session.variantFile}</b></td>
                <td>n = {this.props.session.variants.length}</td>
              </tr>
            </table>
          </ListGroupItem>
        </ListGroup>
      );
    }

    return (
      <Panel>
        <h4>Select Variant File</h4>
        <p>
          Select a text file containing a list of variants.
        </p>

        <Button bsStyle="primary" onClick={this.openFileLoader}><Glyphicon glyph="floppy-disk"/> Select Variant List</Button>
        <FileLoader
              title='Select Variant List File'
              multiple={false}
              text='Using one of the following menas of file access, select a single text file containing a list of variants.'
              handleFileLoad={this.handleFileLoad}
              allowedExtensions={['txt']}
              settings={this.props.settings}
              show={this.state.showFileLoader}
              close={this.closeFileLoader}
        />
        {loadNode}
        {variantNode}
      </Panel>
    );
  }

});

const IndexMessage = React.createClass({
  
  render() {
    if (this.props.file instanceof LocalBAM) {
      if (this.props.file.index) {
        return (<div><Glyphicon glyph='thumbs-up' /> Local Index Loaded</div>);
      }
      else {
        return (<div><Glyphicon glyph='exclamation-sign' /> Needs Local Index</div>);
      }
    } else {
      return null;
    }
  }
});

const DataFileRow = React.createClass({
  
  handleRemove(e) {
    e.preventDefault();
    console.log(this.props);
    this.props.handleRemove(this.props.file.id);
  },

  render() {
    var indexMessage;
    if (this.props.file instanceof LocalBAM) {
      if (this.props.file.index) {
        indexMessage = (<div><td></td><td>Local Index Loaded</td></div>);
      }
      else {
        indexMessage = (<div><td><Glyphicon glyph='warning-sign' /></td><td>Needs Local Index</td></div>);
      }
    } else {
      indexMessage = (<div><td></td><td></td></div>);
    }


    return (
      <tr>
        <td><a href="#" onClick={this.handleRemove}><Glyphicon glyph='remove-sign' /></a></td>
        <td><b>{this.props.file.name}</b></td>
        <td>{indexMessage}</td>
      </tr>
    );
  }
});

const LoadDataPanel = React.createClass({
  
  getInitialState() {
    return { showFileLoader: false };
  },

  openFileLoader() {
    this.setState({ showFileLoader: true });
  },

  closeFileLoader() {
    this.setState({ showFileLoader: false });
  },

  handleFileLoad(files, connection) {
    this.closeFileLoader();
    this.props.handleDataFile(files, connection);
  },

  handleRemove(key) {
    console.log(key);
    this.props.handleRemoveDataFile(key);
  },

  compare(a,b) {
    if (a.name < b.name)
      return -1;
    if (a.name > b.name)
      return 1;
    return 0;
  },

  render() {
    let loadNode;
    if (this.props.loading) {
      let child;
      if (this.props.error) {
        child = (
          <Alert bsStyle='danger' className='someTopMargin'>
            {this.props.error}
          </Alert>
        );
      }
      loadNode = (
        <Loader loaded={this.props.loaded} options={LOADER_OPTIONS}>
          {child}
        </Loader>
      );
    }

    let tableStyle = {
      'width': '100%'
    };

    let fileNodes;
    if (this.props.session.bamFiles.length + this.props.session.baiFiles.length) {
      let files = this.props.session.bamFiles.concat(this.props.session.baiFiles);
      files = files.sort(this.compare);
      let fileRows = files.map((file) => {
        return <DataFileRow file={file} key={file.id} handleRemove={this.handleRemove} />
      });
      // console.log(files);
      fileNodes = (
        <ListGroup className='someTopMargin'>
          <ListGroupItem bsStyle='success'>
            <table style={tableStyle}>
              <tbody>
                {fileRows}
              </tbody>
            </table>
          </ListGroupItem>
        </ListGroup>
      );
    };

    // if (this.props.session.baiFiles.length) {
    //   var baiRows = this.props.session.baiFiles.map((baiFile) => {
    //     console.log(baiFile);
    //     return <DataFileRow file={baiFile} key={baiFile.id} handleRemove={this.handleRemove} />
    //   });

    //   var baiNodes = (
    //     <ListGroup className='someTopMargin'>
    //       <ListGroupItem bsStyle='success'>
    //         <table style={tableStyle}>
    //           {baiRows}
    //         </table>
    //       </ListGroupItem>
    //     </ListGroup>
    //   );
    // }

    return (
      <div>
        <Panel>
          <h4>Select Sequence Data</h4>
          <p>
            Select a sequence file (BAM, BAI, CRAM).
          </p>
          <Button bsStyle="primary" onClick={this.openFileLoader}><Glyphicon glyph="floppy-disk"/>Select Sequence File</Button>
          {loadNode}
          {fileNodes}
        </Panel>
        <FileLoader
          title='Select Sequence Data'
          multiple={true}
          text='Using one of the following menas of file access, select the BAMs you wish to view. Note that for local BAM files, BAIs will also need to be loaded.'
          handleFileLoad={this.handleFileLoad}
          allowedExtensions={['bam', 'bam.bai', 'bai', 'cram', 'crai']}
          settings={this.props.settings}
          show={this.state.showFileLoader}
          close={this.closeFileLoader}
        />
      </div>
    );
  }

});

const LoadManual = React.createClass({

  getInitialState() {
    return {
      session: new Session(),
      dataLoading: false,
      dataLoaded: false,
      dataError: false,
      variantsLoading: false,
      variantsLoaded: false,
      variantsError: false
    };
  },

  closeFixMissingIndexModal() {
    setState({ showFixMissingIndexModal: false });
  },

  handleVariantFile(file, connection) {
    this.setState({variantsLoading: true});
    let session = this.state.session;
    console.log('file')
    console.log(file)
    console.log('connection')
    console.log(connection)
    session.addVariants(file, connection).then(() => {
      this.setState({
        session: session,
        variantsError: false,
        variantsLoaded: true
      });
    }).catch(error => {
      this.setState({
        variantsError: error,
        variantsLoaded: true
      });
      console.log(error);
    });
  },

  handleDataFile(files, connection) {
    this.setState({ dataLoading: true });
    let session = this.state.session;
    session.addSequenceFile(files, connection).then(() => {
      session.matchMaker();
      this.setState({
        session: session,
        dataError: false,
        dataLoaded: true
      });
    }).catch(error => {
      console.log(error);
      this.setState({dataError: error, dataLoaded: true})
    });
  },

  handleRemoveDataFile(id) {
    let session = this.state.session;
    session.remove(id);
    this.setState({session: session});
  },

  handleGoQC(e) {
    e.preventDefault();

    let session = this.state.session;
    // // If there are unmatched files, let the user know and give them a choice    
    // let uf = session.unmatchedSequenceFiles();
    // let ui = session.unmatchedIndexFiles();
    
    // if (uf.length + ui.length > 0) {
    //   console.log(uf);
    //   console.log(ui);
    // }
    let ss = new Sessions();
    ss.sessions[0] = session;
    this.props.handleGoQC(ss);
  },

  // handleReallyGoQC() {
  //   this.props.handleGoQC(s);
  // },

  handleGoBack(e) {
    e.preventDefault();
    this.props.handleGoIntro();
  },

  // shouldComponentUpdate: function(nextProps, nextState) {
  //   console.log(nextState);
  //   return true;
  // },

  render() {
    console.log(this.state.session);
    let proceedNode;
    if (this.state.session.isReady()) {
      proceedNode = ( 
        <Pager>
          <PageItem next href='#' onClick={this.handleGoQC}>Proceed to QC &rarr;</PageItem>
        </Pager>
      );
    } else {
      proceedNode = null;
    }
    
    return (
      <div>
        <Grid>
          <Row className='show-grid'>
            <Col md={3}></Col>
            <Col md={6}>
              <Pager>
                <PageItem previous href='#' onClick={this.handleGoBack}>&larr; Cancel, Return To Main Menu</PageItem>
              </Pager>
              <TitlePanel />
              <LoadVariantsPanel
                handleVariantFile={this.handleVariantFile}
                session={this.state.session}
                settings={this.props.settings}
                loading={this.state.variantsLoading}
                loaded={this.state.variantsLoaded}
                error={this.state.variantsError}
              />
              <LoadDataPanel
                handleDataFile={this.handleDataFile}
                session={this.state.session}
                handleRemoveDataFile={this.handleRemoveDataFile}
                settings={this.props.settings}
                loading={this.state.dataLoading}
                loaded={this.state.dataLoaded}
                error={this.state.dataError}
              />
              {proceedNode}
            </Col>
            <Col md={3}></Col>
          </Row>
        </Grid>
      </div>
    );
  }

});

module.exports = LoadManual;