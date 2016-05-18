"use strict";

import React from 'react';
import {
  Alert,
  Button,
  Col,
  DropdownButton,
  Glyphicon,
  Grid,
  MenuItem,
  Nav,
  Navbar,
  NavItem,
  Panel,
  Row,
} from 'react-bootstrap';
import LoadManual from './loadmanual.jsx';
import LoadBatch from './loadbatch.jsx';
import QC from './qc.jsx';
import { SettingsModal } from './settings.jsx';
import { httpGet } from '../utils.js';
import { fromJS, toJS } from 'immutable';
import styles from '../styles.js';

// var styles = require('../styles.js');
// let settings = fromJS({
//   servers: {
//      remoteHTTP: {
//         type: 'HTTP',
//         location: '',
//         requiresCredentials: true
//       },
//      localHTTP: {
//         type: 'HTTP',
//         location: ''
//       },
//      SSHBridge: {
//         type: 'SSHBridge',
//         localHTTPServer: '',
//         remoteSSHServer: '',
//         username: ''
//       },
//   },
//   defaultZoomLevel: 'unit',
//   autoZoom: true,
//   defaultView: 'mismatch',
//   colors: {
//       A: '#008000', 
//       C: '#0000FF', 
//       G: '#FFA500', 
//       T: '#FF0000', 
//       '-': '#FF69B4', 
//       I: '#800080'
//   },
//   styles: styles,
//   snapshots: true
// });
  
  // Use immutable data structure
  // settings = fromJS(settings);

  // Check for settings at the location from which snoopy is served
  // var request = new XMLHttpRequest();
  // request.open('GET', './settings.json');
  // request.setRequestHeader('Content-Type', 'application/json');
  // request.onload = () => {
  //   if (request.status >= 200 && request.status < 400) {
  //     // Success!
  //     console.log('settings.json exist');
  //     var serverSettings = fromJS(JSON.parse(request.responseText));
  //     settings = settings.mergeDeep(serverSettings);
  //     cb(settings);
  //   } else {
  //     // We reached our target server, but it returned an error
  //     console.log('oops');
  //     cb(settings);
  //   };
  // }
  // request.send();

var Main = React.createClass({  

  getInitialState() {
    let settings = {
      servers: {
         remoteHTTP: {
            type: 'HTTP',
            location: '',
            requiresCredentials: true
          },
         localHTTP: {
            type: 'HTTP',
            location: ''
          },
         SSHBridge: {
            type: 'SSHBridge',
            localHTTPServer: '',
            remoteSSHServer: '',
            username: ''
          },
      },
      defaultZoomLevel: 'unit',
      autoZoom: true,
      defaultView: 'mismatch',
      colors: {
          A: '#008000', 
          C: '#0000FF', 
          G: '#FFA500', 
          T: '#FF0000', 
          '-': '#FF69B4', 
          I: '#800080'
      },
      styles: styles,
      snapshots: true
    };
    settings = fromJS(settings);
    return {
      view: 'intro',  //intro, loadmanual, loadbatch, qc
      settings: settings
    };
  },

  componentDidMount() {
    // Settings.init((settings) => {
    //   this.setState({settings: settings});
    // });
    httpGet('/settings', undefined, {contentType: 'application/json'}).then((result) => {
      let localSettings = fromJS(JSON.parse(result));
      let settings = this.state.settings;
      settings = settings.mergeDeep(localSettings);
      console.log(settings);
      let remoteHTTP = window.localStorage.getItem("snoopyRemoteHTTP");
      console.log(remoteHTTP)
      if (remoteHTTP) {
        console.log('it is here after all')
        remoteHTTP = fromJS(JSON.parse(remoteHTTP));
        settings = settings.mergeDeepIn(['servers','remoteHTTP'], remoteHTTP);
      }
      this.setState({ settings: settings });
    }).catch(error => {
      console.log(error);
    });
  },
  //   var request = new XMLHttpRequest();
  //   request.open('GET', './settings.json');
  //   request.setRequestHeader('Content-Type', 'application/json');
  //   request.onload = () => {
  //     if (request.status >= 200 && request.status < 400) {
  //       // Success!
  //       console.log('settings.json exist');
  //       var serverSettings = fromJS(JSON.parse(request.responseText));
  //       settings = settings.mergeDeep(serverSettings);
  //       cb(settings);
  //     } else {
  //       // We reached our target server, but it returned an error
  //       console.log('oops');
  //       cb(settings);
  //     };
  //   }
  //   request.send();
  

  handleSettings(settings) {
    console.log(settings.toJS());
    this.setState({settings: settings})
  },

  handleGoManual() {
    this.setState({view: 'loadmanual'});
  },

  handleGoBatch() {
    this.setState({view: 'loadbatch'});
  },

  handleGoQC(sessions) {
    this.setState({view: 'qc', sessions: sessions});
  },

  handleGoIntro() { 
    this.setState({view: 'intro'});
  },

  render() {
    var child;
    switch (this.state.view) {
      case 'intro':
        child = <Intro handleGoManual={this.handleGoManual}  handleGoBatch={this.handleGoBatch} />;
        break;
      case 'loadmanual':
        child = <LoadManual handleGoQC={this.handleGoQC} handleGoIntro={this.handleGoIntro} settings={this.state.settings} />;
        break;
      case 'loadbatch':
        console.log(this.state.settings.toJS());
        child = <LoadBatch 
          handleGoQC={this.handleGoQC}
          handleGoIntro={this.handleGoIntro}
          settings={this.state.settings}
          handleSettings={this.handleSettings}
        />;
        break;
      case 'qc':
        child = <QC sessions={this.state.sessions} settings={this.state.settings} />;
        break;
      default:
        child = <Intro />;
    }
    // console.log(this.state.settings);
    return (
      <div className="outerWrapper">
        <MainToolbar view={this.state.view} settings={this.state.settings} handleSettings={this.handleSettings} />
        {child}
      </div>
    );
  },

});

var Intro = React.createClass({

  render() {
    // console.log(styles);
    return (
      <div className="innerWrapper">
        <Grid>
          <Row className='show-grid'>
            <Col md={3}></Col>
            <Col md={6}>
              <IntroPanel />
              <ManualPanel handleGoManual={this.props.handleGoManual} />
              <BatchPanel  handleGoBatch={this.props.handleGoBatch} />
            </Col>
            <Col md={3}></Col>
          </Row>
        </Grid>
      </div>
    );
  }

});


var MainToolbar = React.createClass({

  getInitialState(){
    return { showSettings: false };
  },

  openSettings() {
    this.setState({ showSettings: true });
  },

  closeSettings() {
    this.setState({ showSettings: false });
  },

  handleLinkClick(url) {
    let newTab = window.open(url, '_blank');
    if(newTab)
        newTab.focus();
    else
        alert('Please allow popups for this site.');
  },
// this.onClick.bind(null, this.state.text)}
  render() {
      return (
        <div>
          <Navbar brand='Snoopy' inverse toggleNavKey={0}>
            <Nav right eventKey={0}> {/* This is the eventKey referenced */}
              <NavItem eventKey={1} href='#' onClick={this.openSettings}>Settings</NavItem>
              <NavItem eventKey={2} href='#' onClick={this.handleLinkClick.bind(null, 'http://snoopy.readthedocs.io')}>Help</NavItem>
              <NavItem eventKey={3} href='#' onClick={this.handleLinkClick.bind(null, 'https://github.com/wtsi-medical-genomics/snoopy')}>GitHub</NavItem>
            </Nav>
          </Navbar>

          <SettingsModal
            settings={this.props.settings}
            handleSettings={this.props.handleSettings}
            show={this.state.showSettings}
            close={this.closeSettings}
            view={this.props.view}
          />
        </div>
      );
    
  }

});

var IntroPanel = React.createClass({

  render() {
    return (
      <Panel>
      <h4>Welcome to Snoopy</h4>
        <p>
          Snoopy is a quality control tool to review predicted variants in BAM files using the Dalliance genome browser. There are a few ways to use this tool:
        </p>
      </Panel>
    );
  }

});


var ManualPanel = React.createClass({

  handleClick(e) {
    e.preventDefault();
    this.props.handleGoManual();
  },

  render() {
    var style = {
      backgroundColor: '#D5EBF6'
    };

    return (
      <Panel style={style}>
        <h4>Manual</h4>
          <p>
            This mode is used when you want to manually add files from your local machine or from a server. Using Snoopy in this way will limit you to only one variant file.
          </p>
          <Button bsStyle="primary" onClick={this.handleClick}>Go Manual<Glyphicon glyph="chevron-right"/></Button>
      </Panel>
    );
  }

});


var BatchPanel = React.createClass({
  
  handleClick(e) {
    e.preventDefault();
    this.props.handleGoBatch();
  },

  render() {

    var panelStyle = {
      backgroundColor: '#EEFFEB'
    };

    return (
      <Panel style={panelStyle}>
        <h4>Batch</h4>
          <p>
            In this mode you have a file prepared that lists multiple “sessions”. Each session consists of a remote file listing variants along with a collection of remote BAM files.
          </p>
          <Button bsStyle="success" onClick={this.handleClick}>Go Batch<Glyphicon glyph="chevron-right"/></Button>
      </Panel>
    );
  }

});


module.exports = Main;
