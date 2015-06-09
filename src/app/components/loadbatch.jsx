var React = require('react');

var rb = require('react-bootstrap');
var Alert = rb.Alert;
var Panel = rb.Panel;
var Col = rb.Col;
var Row = rb.Row;
var Grid = rb.Grid;
var Button = rb.Button;
var Glyphicon = rb.Glyphicon;
var Pager = rb.Pager;
var PageItem = rb.PageItem;
var ModalTrigger = rb.ModalTrigger;
var ListGroup = rb.ListGroup;
var ListGroupItem = rb.ListGroupItem;
var Input = rb.Input;

var FileLoader = require('./fileloader.jsx');
var utils = require('../utils.js');
var getExtension = utils.getExtension;
var getName = utils.getName;

var session = require('../session.js');
var Session = session.Session;
var Sessions = session.Sessions;

var lft = require('../loadedfiletypes.js');
var LocalBAM = lft.LocalBAM;
var LocalBAI = lft.LocalBAI;
var RemoteBAM = lft.RemoteBAM;
var RemoteBAI = lft.RemoteBAI;

var LoadBatch = React.createClass({

  getInitialState() {
    return {sessions: new Sessions()};
  },

  handleGoQC(e) {
    e.preventDefault();
    this.props.handleGoQC();
  },

  handleGoBack(e) {
    e.preventDefault();
    this.props.handleGoIntro();
  },

  render() {
    console.log('handleGoBatch');
    return (
      <div>
        <Grid>
          <Row className='show-grid'>
            <Col md={3}></Col>
            <Col md={6}>
              <TitlePanel />
              <SelectConnectionPanel />
              <LoadFilePanel />
              <Pager>
                <PageItem previous href='#' onClick={this.handleGoBack}>&larr; Cancel, Return To Main Menu</PageItem>
                <PageItem next href='#' onClick={this.handleGoQC}>Proceed to QC &rarr;</PageItem>
              </Pager>
            </Col>
            <Col md={3}></Col>
          </Row>
        </Grid>
      </div>
    );
  }
});

var TitlePanel = React.createClass({

  render: function() {
    return (
      <Panel>
        <h4>Batch Mode</h4>
      </Panel>
    );
  }

});

var LoadFilePanel = React.createClass({
  
  parseJSON(jso, filename) {
    // There are two different types of JSON formats ( see docs) so
    // need to figure out which one is being used.
    console.log(filename);
    console.log(jso);
    var sessions = jso["sessions"];
    
    var re_dna_location = /[chr]*[0-9,m,x,y]+[-:,\s]+\w+/i;

    // remove anything that may be loaded 
    variantFiles = [];
    bamFiles = [];
    baiFiles = [];
    for (var i=0; i<sessions.length; i++) {
      if (!sessions[i]['variants'] || !sessions[i]['bams']) {
        this.renderFileLoadingErrorList('<strong>Error</strong>: ill-formed JSON in ' + filename + '. Check file syntax at <a href="http://jsonlint.com/">http://jsonlint.com/</a>');
        continue;
      }
        var s = new Session();
        var v = sessions[i]["variants"];
        if (typeof(v) === 'string') {
          if (v.match(re_dna_location)) {
            // A single dna location
            s.parseVariants(v);
          } else {
            // A file path
            var request = new XMLHttpRequest();
            request.open('GET', url, false);
            request.setRequestHeader('Range', 'bytes=0-1');
            request.withCredentials = credentials;
            request.onload = () => {
              if (request.status >= 200 && request.status < 400) {
                s.parseVariants(request.responseText);
              } else {
                // We reached our target server, but it returned an error
                console.log('it does not exist');
              }
            }
            request.send();
          }
        } else if (typeof(v) === 'object') {
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
  },

  handleFileLoad(file) {
    var file = React.findDOMNode(this.refs.file).files[0];
    console.log(file);
    console.log('here');
    if (getExtension(file) === 'json') {
      var reader = new FileReader();
      reader.readAsText(file);
      reader.onload = () => {
        this.parseJSON(JSON.parse(reader.result), file.name);
      }
    }
  },

  render() {
    return (
      <Panel>
        <h4>Select Batch File</h4>
        <p>
          Select a local JSON file containing a list of sessions. Consult the help for a detailed description of the expected format.
        </p>
        <input type="file" ref="file" onChange={this.handleFileLoad} />
      </Panel>
    );
  }

});

var SelectConnectionPanel = React.createClass({
  render() {
    return (
      <Panel>
        <h4>Select Connection Type</h4>
        <p>
          In the batch mode, a JSON file lists the variants/variant files and sequencing data located either on a remote server or through a local server (see help for more info). Please select the a means of accessing the files listed in your JSON file.
        </p>
        <Input type='select' label='Select connection' placeholder='select'>
          <option value='select'>SSH-BRIDGE: dr9@farm3-login</option>
          <option value='other'>LOCAL HTTP: 127.0.0.1:8000</option>
          <option value='other'>REMOTE HTTP: web-lustre-01.internal.sanger.ac.uk</option>
          <option value='other'>other...</option>
        </Input>
        <Input type="checkbox" ref="credentials" label="Requires credentials" />
      </Panel>
    );
  }
});

// var SessionPanel = React.createClass({
//   return (
//     <Table>
//       <thead>
//         <tr>
//           <th>#</th>
//           <th>Table heading</th>
//           <th>Table heading</th>
//           <th>Table heading</th>
//           <th>Table heading</th>
//           <th>Table heading</th>
//           <th>Table heading</th>
//         </tr>
//       </thead>
//       <tbody>
//         <tr>
//           <td>1</td>
//           <td>Table cell</td>
//           <td>Table cell</td>
//           <td>Table cell</td>
//           <td>Table cell</td>
//           <td>Table cell</td>
//           <td>Table cell</td>
//         </tr>
//         <tr>
//           <td>2</td>
//           <td>Table cell</td>
//           <td>Table cell</td>
//           <td>Table cell</td>
//           <td>Table cell</td>
//           <td>Table cell</td>
//           <td>Table cell</td>
//         </tr>
//         <tr>
//           <td>3</td>
//           <td>Table cell</td>
//           <td>Table cell</td>
//           <td>Table cell</td>
//           <td>Table cell</td>
//           <td>Table cell</td>
//           <td>Table cell</td>
//         </tr>
//       </tbody>
//     </Table>
//   );

// });

// var SessionsPanel = React.createClass({
//   render () {
//     return (
      
//     );
//   }
// });

module.exports = LoadBatch;