"use strict";

var React = require('react');
var rb = require('react-bootstrap');
var Col = rb.Col;
var Row = rb.Row;
var Grid = rb.Grid;
var Button = rb.Button;
var Glyphicon = rb.Glyphicon;
var TabbedArea = rb.TabbedArea;
var TabPane = rb.TabPane;
var Modal = rb.Modal;
var Input = rb.Input;
var Alert = rb.Alert;

var utils = require('../utils.js');
var getExtension = utils.getExtension;
var arrayStringContains = utils.arrayStringContains;
var combineServerPath = utils.combineServerPath;
var httpExists = utils.httpExists;

var styles = require('../styles.js');
var fromJS = require('immutable').fromJS;

// function getPrefix(settings, connection) {
//   switch (connection) {
//     case 'remoteHTTP':
//       return settings.servers.remoteHTTP.location + '/';
//     case 'localHTTP':
//       return settings.servers.localHTTP.location + '/';
//     case 'SSHBridge':
//       var sb = settings.servers.SSHBridge;
//       return sb.localHTTPServer + '/' + '?user=' + sb.username + '&server=' + sb.remoteSSHServer + '&path=';
//   }
// }

// function init(cb) {
//   console.log('in init');
//   var settings = {
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
//   // return settings;
// }

var SettingsModal = React.createClass({

  handleSubmit() {

    var errors = [];
    console.log(styles);
    var currentLevel = this.refs.currentLevel.getChecked();
    if (currentLevel) {
      var currentZoomLevel = parseInt(this.refs.currentZoomLevel.getValue().trim());
      if (isNaN(currentZoomLevel) || currentZoomLevel < 0) {
        errors.push('Please enter a number greater than 0 for current Dalliance zoom level.');
      }
    }
    
    var coverageThreshold = parseFloat(this.refs.coverageThreshold.getValue().trim());
    var coverageHeight = parseInt(this.refs.coverageHeight.getValue().trim());
    if (isNaN(coverageThreshold) || coverageThreshold < 0 || coverageThreshold > 1)
      errors.push('Please enter a number in the range [0,1] for coverage threshold.');
    if (isNaN(coverageHeight) || coverageHeight < 0)
      errors.push('Please enter a number greater than 0 for coverage height.'); 
    
    if (errors.length > 0) {
      console.log(errors);
      return;
    }

    var newSettings = {
      servers: {
       remoteHTTP: {
          location: this.refs.remoteHTTP.getValue().trim(),
          requiresCredentials: this.refs.remoteHTTPCredentials.getChecked()
        },
       localHTTP: {
          location: this.refs.localHTTP.getValue().trim()
        },
       SSHBridge: {
          localHTTPServer: this.refs.SSHBridge_localHTTPServer.getValue().trim(),
          remoteSSHServer: this.refs.SSHBridge_remoteSSHServer.getValue().trim(),
          username: this.refs.SSHBridge_username.getValue().trim()
        },
      },
      defaultZoomLevel: this.refs.unitBase.getChecked() ? 'unit' : currentZoomLevel,
      autoZoom: this.refs.autoZoom.getChecked(),
      colors: {
        A: this.refs.A.getDOMNode().value, 
        C: this.refs.C.getDOMNode().value, 
        G: this.refs.G.getDOMNode().value, 
        T: this.refs.T.getDOMNode().value, 
        '-': this.refs.D.getDOMNode().value, 
        I: this.refs.I.getDOMNode().value
      },
      snapshots: this.refs.snapshots.getChecked()
    };

    var settings = this.props.settings;
    settings = settings.mergeDeep(newSettings);
    settings = settings.setIn(['styles','raw','styles',2,'style','__INSERTIONS'], this.refs.rawShowInsertions.getChecked());
    settings = settings.setIn(['styles','raw','styles',2,'style','__disableQuals'], !this.refs.rawEnableQuals.getChecked());

    settings = settings.setIn(['styles','mismatch','styles',2,'style','_minusColor'], this.refs.mismatchMinusStrandColor.getDOMNode().value);
    settings = settings.setIn(['styles','mismatch','styles',2,'style','_plusColor'], this.refs.mismatchPlusStrandColor.getDOMNode().value); 
    settings = settings.setIn(['styles','mismatch','styles',2,'style','__INSERTIONS'], this.refs.mismatchShowInsertions.getChecked()); 
    settings = settings.setIn(['styles','mismatch','styles',2,'style','__disableQuals'], !this.refs.mismatchEnableQuals.getChecked()); 
    
    settings = settings.setIn(['styles','coverage','styles',2,'style','HEIGHT'],  coverageHeight); 

    settings = settings.setIn(['styles','condensed','styles',2,'style','_minusColor'], this.refs.condensedMatchColor.getDOMNode().value); 
    settings = settings.setIn(['styles','condensed','styles',2,'style','_plusColor'], this.refs.condensedMatchColor.getDOMNode().value); 
    settings = settings.setIn(['styles','condensed','styles',2,'style','__disableQuals'], !this.refs.condensedEnableQuals.getChecked()); 

    this.props.handleSettings(settings);
    this.close();
  },

  close(){
    this.props.close();
  },

  render() {
    var currentZoomNode = (
      <div>
        <Input type="text" ref="currentZoomLevel" addonAfter="bp"/>
        <Button bsStyle="primary">Capture current zoom level</Button>
      </div>
    );
    console.log(this.props.settings);
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
                <dt>Dalliance zoom level</dt>
                <dd>
                  <Input type="radio"
                    ref="unitBase"
                    name="defaultZoomLevel"
                    label="Unit base"
                    defaultChecked={this.props.settings.get('defaultZoomLevel') === 'unit'} />
                  <Input type="radio"
                    ref="currentLevel"
                    name="defaultZoomLevel"
                    label={currentZoomNode}
                    defaultChecked={typeof(this.props.settings.get('defaultZoomLevel')) === 'number'} />
                </dd>
                <dd>
                  <Input type="checkbox"
                    ref="autoZoom"
                    label="Automatically zoom to default level when visiting new candidate variant"
                    defaultChecked={this.props.settings.get('autoZoom')} />
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
              </dl>
            </form>
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