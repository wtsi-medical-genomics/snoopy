"use strict";

import React from 'react';
import FileLoader from './fileloader.jsx';
import Loader from 'react-loader';
import {
  Col,
  Grid,
  Input,
  PageItem,
  Pager,
  Panel,
  Row,
  TabPane,
} from 'react-bootstrap';
import {
  getExtension,
  getName,
  getURL,
  localTextGet,
} from '../utils.js';
import {
  Session,
  Sessions,
} from '../session.js';


const TitlePanel = React.createClass({

  render: function() {
    return (
      <Panel>
        <h4>Batch Mode</h4>
      </Panel>
    );
  }

});

const LoadFilePanel = React.createClass({
  
   handleFileLoad() {
    let file = React.findDOMNode(this.refs.file).files[0];
    this.props.handleFileLoad(file);
  },

  render() {
    const options = {
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
      scale: 1.00,
    };

    let loadNode;
    if (this.props.loading) {
      let child;
      if (this.props.error) {
        child = (<b>{this.props.error}</b>);
      } else {
        child = (<b>Found {this.props.nSessions} sessions with a total of {this.props.nVariants} variants</b>);
      }

      let panelStyle = {
        backgroundColor: '#EEFFEB',
        wordWrap: 'break-word',
      };

      loadNode = (
        <Loader loaded={this.props.loaded} options={options}>
          <Panel className="someTopMargin" style={panelStyle} >
            {child}
          </Panel>
        </Loader>
      );
    }

    return (
      <Panel>
        <h4>2. Select Batch File</h4>
        <p>
          Select a local JSON file containing a list of sessions. Consult the help for a detailed description of the expected format.
        </p>
        <input type="file" ref="file" onChange={this.handleFileLoad} />
        {loadNode}
      </Panel>
    );
  }

});

const SelectConnectionPanel = React.createClass({

  handleChange(v, e) {
    // this.refs.unitBase.getInputDOMNode().checked
    // let connection = this.refs.connection.getValue();
    console.log(v);
    this.props.handleConnection(v);
  },

  componentDidMount() {
    this.handleChange();
  },

  render() {
    let remoteHTTPLocation = this.props.settings.getIn(['servers','remoteHTTP','location']);
    let localHTTPLocation = this.props.settings.getIn(['servers','localHTTP','location']);
    let sshBridgeLocation = this.props.settings.getIn(['servers','SSHBridge','remoteSSHServer']);
    let remoteHTTPNode, localHTTPNode, sshBridgeNode;
    if (remoteHTTPLocation) {
      let label = 'Remote HTTP - ' + remoteHTTPLocation;
      remoteHTTPNode = (
        <Input type="radio"
          ref="remoteHTTP"
          name="connection"
          label={label}
          onChange={this.handleChange.bind(this, "remoteHTTP")}
        />
      );
    }

    if (localHTTPLocation) {
      console.log(localHTTPLocation);
      let label = 'Local HTTP - ' + localHTTPLocation;
      localHTTPNode = (
        <Input type="radio"
          ref="localHTTP"
          name="connection"
          label={label}
          onChange={this.handleChange.bind(this, "localHTTP")}
        />
      );
    }

    if (sshBridgeLocation) {
      let label = 'SSH-Bridge - ' + sshBridgeLocation;
      sshBridgeNode = (
        <Input type="radio"
          ref="SSHBridge"
          name="connection"
          label={label}
          onChange={this.handleChange.bind(this, "SSHBridge")}
        />
      );
    }
    let formStyle = {
      backgroundColor: 'aliceblue',
      padding: '10px',
    };

    // let opt1 = 'Remote HTTP - ' + this.props.settings.getIn(['servers','remoteHTTP','location']);
    // let opt2 = 'Local HTTP - ' + this.props.settings.getIn(['servers','localHTTP','location']);
    // let opt3 = 'SSH-Bridge - ' + this.props.settings.getIn(['servers','SSHBridge','username']) + '@' + this.props.settings.getIn(['servers','SSHBridge','remoteSSHServer']);
    return (
      <div>
      <Panel >
        <h4>1. Select Connection Type</h4>
        <p>
          In the batch mode, a local JSON file lists the variants/variant files and sequencing data located either on a remote server or through a local server (see help for more info). Please select the location of your variant/sequence data listed in your local JSON file.
        </p>
        <form style={formStyle}>
          {remoteHTTPNode}
          {localHTTPNode}
          {sshBridgeNode}
        </form>
      </Panel>
      </div>
    );
  }
});

const LoadBatch = React.createClass({

  getInitialState() {
    return {
      connection: null,
      file: null,
      sessions: null,
      nSessions: 0,
      nVariants: 0,
      loaded: false,
      error: '',
    };
  },

  handleConnection(connection) {
    this.setState(
      { connection: connection },
      this.digestBatchFile
    );

    
  },

  handleGoQC(e) {
    e.preventDefault();
    this.props.handleGoQC(this.state.sessions);
  },

  handleGoBack(e) {
    e.preventDefault();
    this.props.handleGoIntro();
  },

  // handleSessions(sessions) {
  //   this.setState({sessions: sessions});
  // },

  handleSessions(sessions) {
    console.log(sessions);
    if (sessions) {
      this.setState({
        nSessions: sessions.getNumSessions(),
        nVariants: sessions.getNumVariants(),
        loaded: true,
        sessions: sessions,
      });
    } else {
      this.setState({
        nSessions: 0,
        nVariants: 0,
        loaded: true,
      });
    }
    // this.props.handleSessions(sessions);
  },

  handleFileLoad(file) {
    this.setState(
      {file: file},
      this.digestBatchFile
    );
  },

  digestBatchFile() {
    // User clicked cancel
    let file = this.state.file;
    let connection = this.state.connection;

    if (!file || !connection)
      return;

    this.setState({ loading: true });
    console.log(file);
    console.log('here');
    let ext = getExtension(file);
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
        let ss = new Sessions();
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
      let connection = this.props.settings.getIn(['servers', this.state.connection]);
      console.log(connection);
      let s = new Session();
      let v, bams;
      if (jso.variants && jso.variants.length > 0) {
        v = jso.variants;
      } else {
        throw 'Provided JSON contains a session which does not list any variants. Consult help for instructions and examples of valid JSON batch files.'
      }
      if (jso.bams && jso.bams.length > 0) {
        bams = jso.bams;
      } else {
        throw 'Provided JSON contains a session which does not list any BAMs or CRAMs. Consult help for instructions and examples of valid JSON batch files.'
      }

      s.addVariants(v, connection).then(() => {
        return Promise.all(bams.map(bam => {
          let file = getURL(bam, connection);
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

  render() {
    let proceedNode;
    console.log(this.state.sessions);
    if (this.state.sessions) {
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
              <SelectConnectionPanel
                settings={this.props.settings}
                handleConnection={this.handleConnection}
              />
              <LoadFilePanel
                settings={this.props.settings}
                connection={this.state.connection}
                handleSessions={this.handleSessions}
                handleFileLoad={this.handleFileLoad}
                nSessions={this.state.nSessions}
                nVariants={this.state.nVariants}
                loaded={this.state.loaded}
                loading={this.state.loading}
                error={this.state.error}
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


module.exports = LoadBatch;