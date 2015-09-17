"use strict";

import React from 'react';

import {
  Col,
  Row,
  Grid,
  Button,
  Glyphicon,
  TabbedArea,
  TabPane,
  Modal,
  Input,
  Alert,
} from 'react-bootstrap';

import {
  fromJS,
  Map,
} from 'immutable';

import {
  getExtension,
  arrayStringContains,
  combineServerPath,
  httpExists,
} from '../utils.js';

import styles from '../styles.js';

import {
  getDallianceZoomLevel,
  getDallianceZoomBase,
} from './qc.jsx';


// function getPrefix(settings, connection) {
//   switch (connection) {
//     case 'remoteHTTP':
//       return settings.servers.remoteHTTP.location + '/';
//     case 'localHTTP':
//       return settings.servers.localHTTP.location + '/';
//     case 'SSHBridge':
//       let sb = settings.servers.SSHBridge;
//       return sb.localHTTPServer + '/' + '?user=' + sb.username + '&server=' + sb.remoteSSHServer + '&path=';
//   }
// }

// function init(cb) {
//   console.log('in init');
//   let settings = {
//     servers: {
//        remoteHTTP: {
//           type: 'HTTP',
//           location: '',
//           requiresCredentials: true
//         },
//        localHTTP: {
//           type: 'HTTP',
//           location: ''
//         },
//        SSHBridge: {
//           type: 'SSHBridge',
//           localHTTPServer: '',
//           remoteSSHServer: '',
//           username: ''
//         },
//     },
//     defaultZoomLevel: 'unit',
//     autoZoom: true,
//     defaultView: 'mismatch',
//     colors: {
//         A: '#008000', 
//         C: '#0000FF', 
//         G: '#FFA500', 
//         T: '#FF0000', 
//         '-': '#FF69B4', 
//         I: '#800080'
//     },
//     styles: styles,
//     snapshots: true
//   };
  
//   // Use immutable data structure
//   settings = fromJS(settings);

//   // Check for settings at the location from which snoopy is served
//   let request = new XMLHttpRequest();
//   request.open('GET', './settings.json');
//   request.setRequestHeader('Content-Type', 'application/json');
//   request.onload = () => {
//     if (request.status >= 200 && request.status < 400) {
//       // Success!
//       console.log('settings.json exist');
//       let serverSettings = fromJS(JSON.parse(request.responseText));
//       settings = settings.mergeDeep(serverSettings);
//       cb(settings);
//     } else {
//       // We reached our target server, but it returned an error
//       console.log('oops');
//       cb(settings);
//     };
//   }
//   request.send();
//   // return settings;
// }

const SettingsModal = React.createClass({

  getInitialState() {
    return { errors: [] };
  },

  addError(e) {
    let errors = this.state.errors;
    let newErrors = errors.concat([e]);
    this.setState({ errors: newErrors });
  },

  handleSubmit() {

    let newErrors = [];
    let remoteHTTP = this.refs.remoteHTTP.getValue().trim();
    let remoteHTTPCredentials = this.refs.remoteHTTPCredentials.getChecked();
    let localHTTP = this.refs.localHTTP.getValue().trim();
    let localHTTPCredentials = this.refs.localHTTPCredentials.getChecked();
    let SSHBridge_localHTTPServer = this.refs.SSHBridge_localHTTPServer.getValue().trim();
    let SSHBridge_remoteSSHServer = this.refs.SSHBridge_remoteSSHServer.getValue().trim();
    let SSHBridge_username = this.refs.SSHBridge_username.getValue().trim();

    let settings = this.props.settings;
    settings = settings.mergeDeep(fromJS({
      servers: {
        remoteHTTP: {
          location: remoteHTTP,
          requiresCredentials: remoteHTTPCredentials,
        },
        localHTTP: {
          location: localHTTP,
          requiresCredentials: localHTTPCredentials,
        },
        SSHBridge: {
          localHTTPServer: SSHBridge_localHTTPServer,
          remoteSSHServer: SSHBridge_remoteSSHServer,
          username: SSHBridge_username,
        }
      }
    }));

    if (this.props.view === 'qc') {
      let currentLevel = this.refs.currentLevel.getChecked();
      if (currentLevel) {
        var currentZoomLevel = parseInt(this.refs.currentZoomLevel.getValue().trim());
        if (isNaN(currentZoomLevel) || currentZoomLevel < 0) {
          newErrors.push('Please enter a number greater than 0 for current Dalliance zoom level.');
        } else{
          // Need to store the zoom level factored by Dalliance's zoom base level
          console.log(currentZoomLevel/getDallianceZoomBase());
          currentZoomLevel /= getDallianceZoomBase();
        }
      }
      
      let coverageThreshold = parseFloat(this.refs.coverageThreshold.getValue().trim());
      let coverageHeight = parseInt(this.refs.coverageHeight.getValue().trim());
      if (isNaN(coverageThreshold) || coverageThreshold < 0 || coverageThreshold > 1)
         newErrors.push('Please enter a number in the range [0,1] for coverage threshold.');
      if (isNaN(coverageHeight) || coverageHeight < 0)
         newErrors.push('Please enter a number greater than 0 for coverage height.'); 
      
      if (newErrors.length) {
        this.setState({ errors: newErrors });
        return;
      }

      settings = settings.set('colors', Map({
        A: this.refs.A.getDOMNode().value, 
        C: this.refs.C.getDOMNode().value, 
        G: this.refs.G.getDOMNode().value, 
        T: this.refs.T.getDOMNode().value, 
        '-': this.refs.D.getDOMNode().value, 
        I: this.refs.I.getDOMNode().value
      }));
      settings = settings.set('autoZoom', this.refs.autoZoom.getChecked());
      settings = settings.set('defaultZoomLevel', this.refs.unitBase.getChecked() ? 'unit' : currentZoomLevel);
      settings = settings.set('snapshots', this.refs.snapshots.getChecked());
      settings = settings.setIn(['styles','raw','styles',2,'style','__INSERTIONS'], this.refs.rawShowInsertions.getChecked());
      settings = settings.setIn(['styles','raw','styles',2,'style','__disableQuals'], !this.refs.rawEnableQuals.getChecked());

      settings = settings.setIn(['styles','mismatch','styles',2,'style','_minusColor'], this.refs.mismatchMinusStrandColor.getDOMNode().value);
      settings = settings.setIn(['styles','mismatch','styles',2,'style','_plusColor'], this.refs.mismatchPlusStrandColor.getDOMNode().value); 
      settings = settings.setIn(['styles','mismatch','styles',2,'style','__INSERTIONS'], this.refs.mismatchShowInsertions.getChecked()); 
      settings = settings.setIn(['styles','mismatch','styles',2,'style','__disableQuals'], !this.refs.mismatchEnableQuals.getChecked()); 
      
      settings = settings.setIn(['styles','coverage','styles',2,'style','HEIGHT'],  coverageHeight); 
      //TODO: store coverage threshold 

      settings = settings.setIn(['styles','condensed','styles',2,'style','_minusColor'], this.refs.condensedMatchColor.getDOMNode().value); 
      settings = settings.setIn(['styles','condensed','styles',2,'style','_plusColor'], this.refs.condensedMatchColor.getDOMNode().value); 
      settings = settings.setIn(['styles','condensed','styles',2,'style','__disableQuals'], !this.refs.condensedEnableQuals.getChecked()); 
    }
    console.log(settings.toJS());
    this.props.handleSettings(settings);
    this.close();

  },

  close() {
    this.setState({ errors: [] });
    this.props.close();
  },

  selectCurrentLevel() {
    this.refs.unitBase.getInputDOMNode().checked = false;
    this.refs.currentLevel.getInputDOMNode().checked = true;
  },

  handleCaptureZoomLevel() {
    let z = getDallianceZoomLevel();
    this.refs.currentZoomLevel.getInputDOMNode().value = z;
    this.selectCurrentLevel();
  },

  render() {
    let currentZoomLevel = '';
    if (typeof(this.props.settings.get('defaultZoomLevel')) === 'number')
      currentZoomLevel = this.props.settings.get('defaultZoomLevel');

    let currentZoomNode = (
      <div>
        <Input
          type="text"
          ref="currentZoomLevel"
          addonAfter="bp"
          onChange={this.selectCurrentLevel}
          defaultValue={Math.round(currentZoomLevel * getDallianceZoomBase())}
        />
        <Button
          onClick={this.handleCaptureZoomLevel}
          bsStyle="primary"
        >
          Capture current zoom level
        </Button>
      </div>
    );
    let dallianceSettings;
    if (this.props.view === 'qc') {
      dallianceSettings = (
        <div>
          <dt>Dalliance zoom level</dt>
          <dd>
            <Input type="checkbox"
              ref="autoZoom"
              label="Automatically zoom to default level when visiting new candidate variant"
              defaultChecked={this.props.settings.get('autoZoom')}
            />
          </dd>
          <dd>
            <Input type="radio"
              ref="unitBase"
              name="defaultZoomLevel"
              label="Unit base"
              defaultChecked={this.props.settings.get('defaultZoomLevel') === 'unit'}
            />
            <Input type="radio"
              ref="currentLevel"
              name="defaultZoomLevel"
              label={currentZoomNode}
              defaultChecked={typeof(this.props.settings.get('defaultZoomLevel')) === 'number'}
            />
          </dd>
          <dt>Color settings</dt>
          <dd>
            <input type="color" ref="A" defaultValue={this.props.settings.getIn(['colors','A'])} /> A<br/>
            <input type="color" ref="C" defaultValue={this.props.settings.getIn(['colors','C'])} /> C<br/>
            <input type="color" ref="G" defaultValue={this.props.settings.getIn(['colors','G'])} /> G<br/>
            <input type="color" ref="T" defaultValue={this.props.settings.getIn(['colors','T'])} /> T<br/>
            <input type="color" ref="D" defaultValue={this.props.settings.getIn(['colors', '-'])} /> Deletion<br/>
            <input type="color" ref="I" defaultValue={this.props.settings.getIn(['colors','I'])} /> Insertion<br/>
            
          </dd>
          <dt>Raw style</dt>
          <dd>
            <Input type="checkbox"
              ref="rawShowInsertions"
              label="Show insertions"
              defaultChecked={this.props.settings.getIn(['styles','raw','styles', 2, 'style','__INSERTIONS'])} />
            <Input type="checkbox"
              ref="rawEnableQuals"
              label="Reflect base quality with transparency"
              defaultChecked={!this.props.settings.getIn(['styles','raw','styles',2,'style','__disableQuals'])} />
          </dd>
          <dt>Mismatch style</dt>
          <dd>
            <input type="color" 
              ref="mismatchPlusStrandColor"
              defaultValue={this.props.settings.getIn(['styles','mismatch','styles',2,'style','_plusColor'])} /> Plus strand color <br/>
            <input type="color" 
              ref="mismatchMinusStrandColor"
              defaultValue={this.props.settings.getIn(['styles','mismatch','styles',2,'style','_minusColor'])} /> Minus strand color <br/>
            <Input type="checkbox"
              ref="mismatchShowInsertions"
              label="Show insertions" 
              defaultChecked={this.props.settings.getIn(['styles','mismatch','styles',2,'style','__INSERTIONS'])} />
            <Input type="checkbox" 
              ref="mismatchEnableQuals"
              label="Reflect base quality with transparency"
              defaultChecked={!this.props.settings.getIn(['styles','mismatch','styles', 2, 'style','__disableQuals'])} />
          </dd>
          <dt>Condensed style</dt>
          <dd>
            <input type="color" 
              ref="condensedMatchColor"
              defaultValue={this.props.settings.getIn(['styles','condensed','styles',2,'style','_minusColor'])} /> Match color<br/>
            <Input type="checkbox" 
              ref="condensedEnableQuals" 
              label="Reflect base quality with transparency" 
              defaultChecked={!this.props.settings.getIn(['styles','condensed','styles',2,'style','__disableQuals'])} />
          </dd>
          <dt>Coverage histogram style</dt>
          <dd>
            <Input type="text"
              ref="coverageThreshold"
              label="Allele threshold (between 0 and 1)" 
              defaultValue={0.2} />
            <Input type="text"
              ref="coverageHeight"
              label="Height"
              defaultValue={this.props.settings.getIn(['styles','coverage','styles',2,'style','HEIGHT'])} />
          </dd>
          <dt>Snapshots</dt>
          <dd>
            <Input type="checkbox" 
              ref="snapshots"
              label="Automatically take snapshots at each variant"
              defaultChecked={this.props.settings.get('snapshots')} />
          </dd>
        </div>
      );
    }

    let errors_alert;
    if (this.state.errors.length) {
      let nodes = this.state.errors.map((e, index) => {
        console.log(e);
        return (
          <li key={index}>
            {e}
          </li>
        );
      })
      errors_alert = (
        <Alert bsStyle='danger'>
          <ul>
            {nodes}
          </ul>
        </Alert>
      );
    }

    return (
      <div>
        <Modal show={this.props.show} onHide={this.close} className="Settings">
          <Modal.Header closeButton>
            <Modal.Title>Settings</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form>
              <dl>
                <dt className="smallTopMargin">Default Remote HTTP</dt>
                <dd>
                  <Input type="text" 
                    ref="remoteHTTP"
                    defaultValue={this.props.settings.getIn(['servers','remoteHTTP','location'])}/>
                  <Input type="checkbox"
                    ref="remoteHTTPCredentials"
                    defaultChecked={this.props.settings.getIn(['servers','remoteHTTP','requiresCredentials'])}
                    label="Requires credentials" />
                </dd>
                <dt>Default Local HTTP</dt>
                <dd>
                  <Input type="text"
                    ref="localHTTP"
                    defaultValue={this.props.settings.getIn(['servers','localHTTP','location'])} />
                  <Input type="checkbox"
                    ref="localHTTPCredentials"
                    defaultChecked={this.props.settings.getIn(['servers','localHTTP','requiresCredentials'])}
                    label="Requires credentials" />
                </dd>
                <dt>Default SSH Bridge</dt>
                <dd>
                  <div className="form-horizontal">
                    <Input type="text" 
                      label="Local HTTP Server"
                      labelClassName="col-md-4" 
                      wrapperClassName="col-md-8" 
                      placeholder="The local server that bridges to the remote server"
                      ref="SSHBridge_localHTTPServer"
                      defaultValue={this.props.settings.getIn(['servers','SSHBridge','localHTTPServer'])} />
                    <Input type="text" 
                      label="Remote SSH Server"
                      labelClassName="col-md-4" 
                      wrapperClassName="col-md-8" 
                      placeholder="The remote SSH server that stores your files"
                      ref="SSHBridge_remoteSSHServer" 
                      defaultValue={this.props.settings.getIn(['servers','SSHBridge','remoteSSHServer'])} />
                    <Input type="text" 
                      label="Local HTTP Server"
                      labelClassName="col-md-4" 
                      wrapperClassName="col-md-8" 
                      placeholder="our username to login to the remote SSH server"
                      ref="SSHBridge_username"
                      defaultValue={this.props.settings.getIn(['servers','SSHBridge','username'])} />
                  </div>
                </dd>
                {dallianceSettings}
              </dl>
            </form>
            {errors_alert}
          </Modal.Body>
          <Modal.Footer>
            <Button bsStyle="primary" onClick={this.handleSubmit}>Save</Button>
            <Button bsStyle="primary" onClick={this.close}>Cancel</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
});

module.exports = {
  SettingsModal: SettingsModal
  // init: init
};
