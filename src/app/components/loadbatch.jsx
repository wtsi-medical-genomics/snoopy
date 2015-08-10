"use strict";

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
var ListGroup = rb.ListGroup;
var ListGroupItem = rb.ListGroupItem;
var Input = rb.Input;

var FileLoader = require('./fileloader.jsx');
var utils = require('../utils.js');
var getExtension = utils.getExtension;
var getName = utils.getName;
var httpGet = utils.httpGet;
var localTextGet = utils.localTextGet;
var getURL = utils.getURL;

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
//var getRequiresCredentials = Settings.getRequiresCredentials;

// var Promise = require('es6-promise').Promise;
var Loader = require('react-loader');

// const RE_DNA_LOCATION = /[chr]*[0-9,m,x,y]+[-:,\s]+\w+/i;

var LoadBatch = React.createClass({

  getInitialState() {
    return {
      connection: '',
      sessions: ''  ,
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
    if (this.state.sessions) {
      var proceedNode = (
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
              <SelectConnectionPanel settings={this.props.settings} handleConnection={this.handleConnection} />
              <LoadFilePanel settings={this.props.settings} connection={this.state.connection} handleSessions={this.handleSessions}/>
              {proceedNode}
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
  
  getInitialState() {
    return {loaded: false,
            loading: false,
            error: '',
            nSessions: 0,
            nVariants: 0 };
  },

  handleSessions(sessions) {
    console.log(sessions);
    if (sessions) {
      this.setState({
        nSessions: sessions.getNumSessions(),
        nVariants: sessions.getNumVariants(),
        loaded: true
      });
    } else {
      this.setState({
        nSessions: 0,
        nVariants: 0,
        loaded: true
      });
    }
    this.props.handleSessions(sessions);
  },

  // parseJSON(jso, filename) {
  //   // There are two different types of JSON formats ( see docs) so
  //   // need to figure out which one is being used.
  //   console.log(filename);
  //   console.log(jso);
  //   // var prefix = getPrefix(this.props.settings, this.props.connection);
  //   var connection = this.props.settings.getIn(['servers', this.props.connection]);
  //   var sessions = jso["sessions"];
  //   var ss = new Sessions();
  //   var re_dna_location = /[chr]*[0-9,m,x,y]+[-:,\s]+\w+/i;

  //   for (var i=0; i<sessions.length; i++) {
  //     if (!sessions[i]['variants'] || !sessions[i]['bams']) {
  //       // this.renderFileLoadingErrorList('<strong>Error</strong>: ill-formed JSON in ' + filename + '. Check file syntax at <a href="http://jsonlint.com/">http://jsonlint.com/</a>');
  //       continue;
  //     }
  //     var s = new Session();
  //     var v = sessions[i]["variants"];
  //     s.addVariants(v);
  //     //s.variantFile = new RemoteVariantFile(this.settings.serverLocation + );
  //     for (var bi=0; bi<sessions[i]["bams"].length; bi++) {
  //       // Add prefix to the file then create the RemoteBAM
  //       var file = getURL(sessions[i]["bams"][bi], connection);
  //       console.log(file);
  //       s.addSequenceFile(file, connection);
  //     }
  //     ss.sessions.push(s);
  //   }
  //   this.handleSessions(ss);
    
  // },

  // digestFile(file) {
  //   var file = React.findDOMNode(this.refs.file).files[0];
  //   console.log(file);
  //   console.log('here');
  //   if (getExtension(file) === 'json') {
  //     textGet(file).then((result) => {
  //       this.parseJSON(JSON.parse(result), file.name);
  //     }).catch((error) => {
  //       console.log(error);
  //     }).then(() => {
  //       console.log('FINISHED EVERYTHING');
  //     });
      
  //     // var reader = new FileReader();
  //     // reader.readAsText(file);
  //     // reader.onload = () => {
  //     //   this.parseJSON(JSON.parse(reader.result), file.name);
  //     // }
  //   }
  // },

  // loadFilePromise() {
  //   return new Promise((fulfill, reject) => {
  //     this.digestFile(file).done(() => {
  //       fulfill()
  //     })
  //   }
  // }
  handleFileLoad() {

    var file = React.findDOMNode(this.refs.file).files[0];

    // User clicked cancel
    if (file === undefined)
      return;

    this.setState({ loading: true });
    console.log(file);
    console.log('here');
    var ext = getExtension(file);
    if (ext === 'json') {
      localTextGet(file).then((result) => {
        console.log(result);
        try {
          return JSON.parse(result)
        } catch(e) {
          console.log('ill formed json');
          throw 'Provided JSON file is ill-formed. To valdate your JSON files use http://jsonlint.com';
        }
      }).then(jso => {
        console.log(jso);    
        if (!jso.sessions) {
          throw 'Provided JSON file does not have a "sessions" listing. Consult help for instructions and examples of valid JSON batch files.';
        }
        return Promise.all(
          jso.sessions.map(sjso => {
            console.log(sjso);
            return this.getSession(sjso);
          })
        );
      }).then(sessions => {
        var ss = new Sessions();
        ss.sessions = sessions;
        this.handleSessions(ss);
        this.setState({
          loaded: true,
          error: ''
        });
      }).catch(error => {
        console.log(error);
        this.handleSessions(null);
        this.setState({
          loaded: true,
          error: error
        });
      });
    } else {
      this.setState({
        loaded: true,
        error: 'Batch file must have json extension, found the following instead: ' + ext
      });
    }
  },

  getSession(jso) {
    return new Promise((resolve, reject) => {
      var connection = this.props.settings.getIn(['servers', this.props.connection]);
      
      var s = new Session();
      if (jso.variants && jso.variants.length > 0) {
        var v = jso.variants;
      } else {
        throw 'Provided JSON contains a session which does not list any variants. Consult help for instructions and examples of valid JSON batch files.'
      }
      if (jso.bams && jso.bams.length > 0) {
        var bams = jso.bams;
      } else {
        throw 'Provided JSON contains a session which does not list any BAMs or CRAMs. Consult help for instructions and examples of valid JSON batch files.'
      }

      s.addVariants(v, connection).then(() => {
        return Promise.all(bams.map(bam => {
          var file = getURL(bam, connection); 
          return s.addSequenceFile(file, connection);
        }));
      }).then(() => {
        resolve(s);
      }).catch(error => {
        console.log(error);
        reject(error);
      });
    });
  },

  // handleFileLoad2(file) {

  //   this.setState({ loading: true });
  //   var file = React.findDOMNode(this.refs.file).files[0];
  //   console.log(file);
  //   console.log('here');
  //   var ext = getExtension(file);
  //   if (ext === 'json') {
  //     localTextGet(file).then((result) => {
  //       var jso = JSON.parse(result);
  //       this.parseJSON(jso, file.name);
  //     }).catch((error) => {
  //       this.setState({loaded: false, error: error});
  //     }).then(() => {
  //       console.log('FINISHED EVERYTHING');
  //       this.setState({ loaded: true });
  //     });
  //   } else {
  //     this.setState({loaded: false,
  //                    error: 'Batch file must have json extension, found the following instead: ' + ext});
  //   }
  // },

  render() {
    var options = {
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

    if (this.state.loading) {
      var child;
      if (this.state.error) {
        child = (<b>{this.state.error}</b>);
      } else {
        child = (<b>Found {this.state.nSessions} sessions with a total of {this.state.nVariants} variants</b>);
      }
      var panelStyle = {
        backgroundColor: '#EEFFEB'
      };
      var loadNode = (
        <Loader loaded={this.state.loaded} options={options}>
          <Panel className="someTopMargin" style={panelStyle} >
            {child}
          </Panel>
        </Loader>
      );
    }

    return (
      <Panel>
        <h4>Select Batch File</h4>
        <p>
          Select a local JSON file containing a list of sessions. Consult the help for a detailed description of the expected format.
        </p>
        <input type="file" ref="file" onChange={this.handleFileLoad} />
        {loadNode}
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
    var opt1 = 'Remote HTTP - ' + this.props.settings.getIn(['servers','remoteHTTP','location']);
    var opt2 = 'Local HTTP - ' + this.props.settings.getIn(['servers','localHTTP','location']);
    var opt3 = 'SSH-Bridge - ' + this.props.settings.getIn(['servers','SSHBridge','username']) + '@' + this.props.settings.getIn(['servers','SSHBridge','remoteSSHServer']);
    return (
      <div>
      <Panel>
        <h4>Select Connection Type</h4>
        <p>
          In the batch mode, a JSON file lists the variants/variant files and sequencing data located either on a remote server or through a local server (see help for more info). Please select the a means of accessing the files listed in your JSON file.
        </p>
        <form>
          <Input type="select" ref="connection" label="Select connection" placeholder="select" onChange={this.handleChange}>
            <option value="remoteHTTP">{opt1}</option>
            <option value="localHTTP">{opt2}</option>
            <option value="SSHBridge">{opt3}</option>
          </Input>
        </form>
      </Panel>
      </div>
    );
  }
});



module.exports = LoadBatch;