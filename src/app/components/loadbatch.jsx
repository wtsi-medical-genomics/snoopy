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
var SSHBAM = lft.SSHBAM;
var RemoteBAM = lft.RemoteBAM;
var RemoteBAI = lft.RemoteBAI;

var Settings = require('./settings.jsx');
var getPrefix = Settings.getPrefix;
var getRequiresCredentials = Settings.getRequiresCredentials;


var LoadBatch = React.createClass({

  getInitialState() {
    return {
      connection: '',
      sessions: '',
    };
  },

  handleConnection(connection) {
    this.setState({connection: connection});
  },

  handleGoQC(e) {
    e.preventDefault();
    this.props.handleGoQC(this.state.sessions);
  },

  handleGoBack(e) {
    e.preventDefault();
    this.props.handleGoIntro();
  },

  handleSessions(sessions) {
    this.setState({sessions: sessions});
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
              <SelectConnectionPanel settings={this.props.settings} handleConnection={this.handleConnection} />
              <LoadFilePanel settings={this.props.settings} connection={this.state.connection} handleSessions={this.handleSessions}/>
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
    var prefix = getPrefix(this.props.settings, this.props.connection);
    var connection = this.props.settings.servers[this.props.connection];
    var sessions = jso["sessions"];    
    var ss = new Sessions();
    var re_dna_location = /[chr]*[0-9,m,x,y]+[-:,\s]+\w+/i;

    for (var i=0; i<sessions.length; i++) {
      if (!sessions[i]['variants'] || !sessions[i]['bams']) {
        // this.renderFileLoadingErrorList('<strong>Error</strong>: ill-formed JSON in ' + filename + '. Check file syntax at <a href="http://jsonlint.com/">http://jsonlint.com/</a>');
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
          var url = prefix + v;
          console.log(url);
          request.open('GET', url, true);
          // request.setRequestHeader('Range', 'bytes=0-1');
          request.withCredentials = connection.requiresCredentials || false;
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
        // Add prefix to the file then create the RemoteBAM
        var file = prefix + sessions[i]["bams"][bi];
        s.addFile(file, connection);
      }
      ss.sessions.push(s);
    }
    this.props.handleSessions(ss);
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
  handleChange() {
    var connection = this.refs.connection.getValue();
    console.log(connection);
    this.props.handleConnection(connection);
  },

  componentDidMount() {
    this.handleChange();
  },

  render() {
    return (
      <Panel>
        <h4>Select Connection Type</h4>
        <p>
          In the batch mode, a JSON file lists the variants/variant files and sequencing data located either on a remote server or through a local server (see help for more info). Please select the a means of accessing the files listed in your JSON file.
        </p>
        <Input type="select" ref="connection" label="Select connection" placeholder="select" onChange={this.handleChange}>
          <option value="remoteHTTP">Remote HTTP : &nbsp; {this.props.settings.servers.remoteHTTP.location}</option>
          <option value="localHTTP">Local HTTP : &nbsp; {this.props.settings.servers.localHTTP.location}</option>
          <option value="SSHBridge">SSH-Bridge : &nbsp; {this.props.settings.servers.SSHBridge.username}@{this.props.settings.servers.SSHBridge.remoteSSHServer}</option>
        </Input>
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