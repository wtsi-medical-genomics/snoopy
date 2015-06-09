var merge = require('merge');
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


var settings = {
  servers: {
     remoteHTTP: {
        location: 'abc',
        requiresCredentials: false
      },
     localHTTP: {
        location: 'def',
        requiresCredemtoa: false
      },
     SSHBridge: {
        location: 'ghi',
        requiresCredemtoa: false
      },
  },
  defaultZoomLevel: 'unit',
  autoZoom: true,
  customZoom: false,
  defaultView: 'mismatch',
  colors: {
      A: '#008000', 
      C: '#0000FF', 
      G: '#FFA500', 
      T: '#FF0000', 
      '-': '#FF69B4', 
      I: '#800080'
  },
  styles: styles
};

function init() {
  console.log('in init');
  // Check for settings at the location from which snoopy is served
  var request = new XMLHttpRequest();
  request.open('GET', './settings.json', true);
  request.setRequestHeader('Content-Type', 'application/json');
  request.onload = () => {
    if (request.status >= 200 && request.status < 400) {
      // Success!
      console.log('settings.json exist');
      var serverSettings = JSON.parse(request.responseText);
      console.log(serverSettings);
      settings = merge.recursive(true, settings, serverSettings);
      console.log(settings);
    } else {
      // We reached our target server, but it returned an error
      console.log('oops');
    };
  }
  request.send();
}

var SettingsModal = React.createClass({

  componentDidMount() {
    init();
  },

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
          location: this.refs.SSHBridge.getValue().trim()
        },
      },
      defaultZoomLevel: this.refs.unitBase.getChecked() || currentZoomLevel,
      autoZoom: this.refs.autoZoom.getChecked(),
      colors: {
        A: this.refs.A.getDOMNode().value, 
        C: this.refs.C.getDOMNode().value, 
        G: this.refs.G.getDOMNode().value, 
        T: this.refs.T.getDOMNode().value, 
        '-': this.refs.D.getDOMNode().value, 
        I: this.refs.I.getDOMNode().value
      }
    };

    settings = merge.recursive(true, settings, newSettings);
    settings.styles.raw.styles[2].style.__INSERTIONS = this.refs.rawShowInsertions.getChecked();
    settings.styles.raw.styles[2].style.__disableQuals = !this.refs.rawEnableQuals.getChecked();

    settings.styles.mismatch.styles[2].style._minusColor = this.refs.mismatchPlusStrandColor.getDOMNode().value;
    settings.styles.mismatch.styles[2].style._plusColor = this.refs.mismatchMinusStrandColor.getDOMNode().value;
    settings.styles.mismatch.styles[2].style.__INSERTIONS = this.refs.mismatchShowInsertions.getChecked();
    settings.styles.mismatch.styles[2].style.__disableQuals = !this.refs.mismatchEnableQuals.getChecked();
    
    settings.styles.coverage.styles[2].style.HEIGHT = coverageHeight;

    settings.styles.condensed.styles[2].style._minusColor = this.refs.condensedMatchColor.getDOMNode().value;
    settings.styles.condensed.styles[2].style._plusColor = this.refs.condensedMatchColor.getDOMNode().value;
    settings.styles.condensed.styles[2].style.__disableQuals = !this.refs.condensedEnableQuals.getChecked();

    console.log(settings);
    this.props.onRequestHide();
  },

  render() {
    var currentZoomNode = (
      <div>
        <Input type="text" ref="currentZoomLevel" addonAfter="bp"/>
        <Button bsStyle="primary">Capture current zoom level</Button>
      </div>
    );
    return (
      <div>
        <Modal {...this.props} title="Settings" animation={false} className="Settings">
          <div className='modal-body'>
            <form>
              <dl>
                <dt className="smallTopMargin">Default Remote HTTP</dt>
                <dd>
                  <Input type="text" ref="remoteHTTP" />
                  <Input type="checkbox" ref="remoteHTTPCredentials" label="Requires credentials" />
                </dd>
                <dt className="smallTopMargin">Default Local HTTP</dt>
                <dd>
                  <Input type="text" ref="localHTTP" />
                </dd>
                <dt className="smallTopMargin">Default SSH Bridge</dt>
                <dd>
                  <Input type="text" ref="SSHBridge" />
                </dd>
                <dt>Dalliance zoom level</dt>
                <dd>
                  <Input type="radio" ref="unitBase" name="defaultZoomLevel" label="Unit base" />
                  <Input type="radio" ref="currentLevel" name="defaultZoomLevel" label={currentZoomNode} />
                </dd>
                <dd>
                  <Input type="checkbox" ref="autoZoom" label="Automatically zoom to default level when visiting new candidate variant" />
                </dd>
                <dt>Color settings</dt>
                <dd>
                  <input type="color" ref="A" /> A<br/>
                  <input type="color" ref="C" /> C<br/>
                  <input type="color" ref="G" /> G<br/>
                  <input type="color" ref="T" /> T<br/>
                  <input type="color" ref="I" /> Insertion<br/>
                  <input type="color" ref="D" /> Deletion<br/>
                </dd>
                <dt>Raw style</dt>
                <dd>
                  <Input type="checkbox" ref="rawShowInsertions" label="Show insertions" />
                  <Input type="checkbox" ref="rawEnableQuals" label="Reflect base quality with transparency" />
                </dd>
                <dt>Mismatch style</dt>
                <dd>
                  <input type="color" ref="mismatchPlusStrandColor" /> Plus strand color <br/>
                  <input type="color" ref="mismatchMinusStrandColor" /> Minus strand color <br/>
                  <Input type="checkbox" ref="mismatchShowInsertions" label="Show insertions" />
                  <Input type="checkbox" ref="mismatchEnableQuals" label="Reflect base quality with transparency" />
                </dd>
                <dt>Condensed style</dt>
                <dd>
                  <input type="color" ref="condensedMatchColor" /> Match color<br/>
                  <Input type="checkbox" ref="condensedEnableQuals" label="Reflect base quality with transparency" />
                </dd>
                <dt>Coverage histogram style</dt>
                <dd>
                  <Input type="text" ref="coverageThreshold" label="Allele threshold (between 0 and 1)" />
                  <Input type="text" ref="coverageHeight" label="Height" />
                </dd>
              </dl>
            </form>
          </div>
          <div className='modal-footer'>
            <Button bsStyle="primary" onClick={this.handleSubmit}>Save</Button>
            <Button onClick={this.props.onRequestHide}>Cancel</Button>
          </div>
        </Modal>
      </div>
    );
  }
});

module.exports = {
  SettingsModal: SettingsModal,
  settings: settings
};