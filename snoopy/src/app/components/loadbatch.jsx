"use strict"

import React from 'react'
import FileLoader from './fileloader.jsx'
import Loader from 'react-loader'
import {
  Col,
  Grid,
  Input,
  PageItem,
  Pager,
  Panel,
  Row,
  TabPane,
} from 'react-bootstrap'
import {
  getExtension,
  getName,
  getURL,
  httpGet,
  localTextGet,
} from '../utils.js'
import Session from '../session.js'
import Sessions from '../sessions.js'
import Immutable from 'Immutable'
import validate from 'validate.js'
import SelectReferencePanel from './selectreferencepanel.jsx'


const TitlePanel = React.createClass({

  render() {
    return (
      <Panel>
        <h4>Batch Mode</h4>
      </Panel>
    )
  }

})

const LoadFilePanel = React.createClass({
  
   handleFileLoad() {
    let file = React.findDOMNode(this.refs.file).files[0]
    this.props.handleFileLoad(file)
  },

  componentDidMount() {
    this.getDOMNode().scrollIntoView()
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
    }

    let loadNode
    if (this.props.loading) {
      let child
      if (this.props.error) {
        child = (<b>{this.props.error}</b>)
      } else {
        child = (<b>Found {this.props.nSessions} sessions with a total of {this.props.nVariants} variants</b>)
      }

      let panelStyle = {
        backgroundColor: '#EEFFEB',
        wordWrap: 'break-word',
      }

      loadNode = (
        <Loader loaded={this.props.loaded} options={options}>
          <Panel className="someTopMargin" style={panelStyle} >
            {child}
          </Panel>
        </Loader>
      )
    }

    return (
      <Panel>
        <h4>Step 3: Select Batch File</h4>
        <p>
          Select a local JSON file containing a list of sessions. Consult the help for a detailed description of the expected format.
        </p>
        <input type="file" ref="file" onChange={this.handleFileLoad} />
        {loadNode}
      </Panel>
    )
  }

})

const SelectConnectionPanel = React.createClass({

  handleChange(v, e) {
    // this.refs.unitBase.getInputDOMNode().checked
    // let connection = this.refs.connection.getValue()
    console.log(v)
    
    this.props.handleConnection(v)
  },

  handleRemoteHTTPChange() {
    let remoteHTTP = {
      location: this.refs.remoteHTTPLocation.getValue().trim(),
      requiresCredentials: this.refs.remoteHTTPCredentials.getChecked(),
    }
    this.props.handleRemoteHTTPChange(remoteHTTP)
    if (this.refs.remoteHTTP.getChecked()) {
      this.props.handleConnection('remoteHTTP')
    }
  },


  componentDidMount() {
    this.handleRemoteHTTPChange()
  },

  render() {
    let remoteHTTPLocation = this.props.settings.getIn(['servers','remoteHTTP','location'])
    console.log('settings again')
    console.log(this.props.settings.toJS())
    console.log(this.props.settings.getIn(['servers','remoteHTTP']).toJS())
    console.log(this.props.settings.getIn(['servers','remoteHTTP','location']))
    let remoteHTTPCredentials = this.props.settings.getIn(['servers','remoteHTTP','requiresCredentials'])
    let localHTTPLocation = this.props.settings.getIn(['servers','localHTTP','location'])
    let sshBridgeLocation = this.props.settings.getIn(['servers','SSHBridge','remoteSSHServer'])

    let remoteHTTPNode, localHTTPNode, sshBridgeNode
    let textStyle = {
      width: 400,
      margin: 0,
    }
    let remoteStyle = {
      marginBottom: -20,
      position: 'relative',
      top: -10,
    }
    let label = (
      <div style={remoteStyle}>
        <Input
          style={textStyle}
          type="text"
          ref="remoteHTTPLocation"
          value={remoteHTTPLocation}
          placeholder="http(s)://...remote web server address..."
          onChange={this.handleRemoteHTTPChange}
        />
        <Input
          type="checkbox"
          ref="remoteHTTPCredentials"
          label="Requires credentials"
          defaultChecked={remoteHTTPCredentials}
          onChange={this.handleRemoteHTTPChange}
        />
      </div>
    )
    remoteHTTPNode = (
      <Input type="radio"
        ref="remoteHTTP"
        name="connection"
        label={label}
        onChange={this.handleChange.bind(this, "remoteHTTP")}
      />
    )


    if (localHTTPLocation) {
      console.log(localHTTPLocation)
      let label = 'Local HTTP - ' + localHTTPLocation
      localHTTPNode = (
        <Input type="radio"
          ref="localHTTP"
          name="connection"
          label={label}
          onChange={this.handleChange.bind(this, "localHTTP")}
        />
      )
    }

    if (sshBridgeLocation) {
      let label = 'SSH-Bridge - ' + sshBridgeLocation
      sshBridgeNode = (
        <Input type="radio"
          ref="SSHBridge"
          name="connection"
          label={label}
          onChange={this.handleChange.bind(this, "SSHBridge")}
        />
      )
    }

    let formStyle = {
      backgroundColor: 'aliceblue',
      padding: '10px',
      width: '100%'
    }

    // let opt1 = 'Remote HTTP - ' + this.props.settings.getIn(['servers','remoteHTTP','location'])
    // let opt2 = 'Local HTTP - ' + this.props.settings.getIn(['servers','localHTTP','location'])
    // let opt3 = 'SSH-Bridge - ' + this.props.settings.getIn(['servers','SSHBridge','username']) + '@' + this.props.settings.getIn(['servers','SSHBridge','remoteSSHServer'])
    return (
      <div>
      <Panel >
        <h4>Step 1: Select Connection Type</h4>
        <p>
          In the batch mode, a local JSON file lists the variants/variant files and sequencing data located either on a remote server or through a local server (see help for more info). Please select the location of your variant/sequence data listed in your local JSON file. Use settings to modify connections. 
        </p>
        <form style={formStyle}>
          {remoteHTTPNode}
          {localHTTPNode}
          {sshBridgeNode}
        </form>
      </Panel>
      </div>
    )
  }
})

const LoadBatch = React.createClass({

  getInitialState() {
    return {
      connection: null,
      file: null,
      sessions: null,
      nSessions: 0,
      nVariants: 0,
      loaded: false,
      referenceIndex: '',
      error: '',
    }
  },

  handleConnection(connection) {
    this.setState(
      { connection: connection },
      this.digestBatchFile
    )
  },

  handleRemoteHTTPChange(remoteHTTP) {
    window.localStorage.setItem('snoopyRemoteHTTP', JSON.stringify(remoteHTTP))
    let settings = this.props.settings
    settings = settings.mergeDeepIn(['servers','remoteHTTP'], Immutable.fromJS(remoteHTTP))
    this.props.handleSettings(settings)
  },

  handleReferenceChange(referenceIndex) {
    this.setState({referenceIndex})
    console.log(referenceIndex)
  },

  handleGoQC(e) {
    e.preventDefault()
    this.props.handleGoQC(this.state.sessions, this.state.referenceIndex)
  },

  handleGoBack(e) {
    e.preventDefault()
    this.props.handleGoIntro()
  },

  // handleSessions(sessions) {
  //   this.setState({sessions: sessions})
  // },

  handleSessions(sessions) {
    console.log(sessions)
    if (sessions) {
      this.setState({
        nSessions: sessions.getNumSessions(),
        nVariants: sessions.getNumVariants(),
        loaded: true,
        sessions,
      })
    } else {
      this.setState({
        nSessions: 0,
        nVariants: 0,
        loaded: true,
      })
    }
    // this.props.handleSessions(sessions)
  },

  handleFileLoad(file) {
    this.setState(
      {file: file},
      this.digestBatchFile //callback
    )
  },


  remoteHttpUrlCheck() {
    return new Promise((resolve, reject) => {
      if (this.state.connection !== 'remoteHTTP') {
        console.log('just about to resolve')
        return resolve()
      }
      const remoteHTTP = this.props.settings.getIn(['servers','remoteHTTP', 'location'])    
      const valid = validate({website: remoteHTTP}, {
        website: {
          url: {
            allowLocal: true,
          }
        }
      })
      if (valid !== undefined) {
        // const error = valid['website'].reduce((accum, curr) =>  accum + curr, '')
        return reject('Remote HTTP address provided in Step 1 is invalid. Please fix or change connection type.')
      } else {
        return resolve()
      }
    })
  },

  digestBatchFile() {
    // User clicked cancel
    let file = this.state.file
    let connection = this.state.connection

    console.log('connection')
    console.log(connection)

    if (!file || !connection)
      return

    console.log('can you read this')
    this.setState({ loading: true })
    console.log(file)
    console.log('here')
    let ext = getExtension(file)
    if (ext === 'json') {
      this.remoteHttpUrlCheck()
      .then(() => {
        return localTextGet(file)
      }).then((result) => {
        console.log(result)
        try {
          return JSON.parse(result)
        } catch(e) {
          console.log('ill formed json')
          throw 'Provided JSON file is ill-formed. To validate your JSON files use http://jsonlint.com'
        }
      }).then(jso => {
        console.log(jso)
        if (!jso.sessions) {
          throw 'Provided JSON file does not have a "sessions" listing. Consult help for instructions and examples of valid JSON batch files.'
        }
        return Promise.all(
          jso.sessions.map(sjso => {
            console.log(sjso)
            return this.getSession(sjso)
          })
        )
      }).then(sessions => {
        const reference = this.props.referencesSummary[this.state.referenceIndex]
        let ss = new Sessions(reference)
        ss.sessions = sessions
        this.handleSessions(ss)
        this.setState({
          loaded: true,
          error: ''
        })
      }).catch(error => {
        console.log(error)
        this.handleSessions(null)
        this.setState({
          loaded: true,
          error: error
        })
      })
    } else {
      this.setState({
        loaded: true,
        error: 'Batch file must have json extension, found the following instead: ' + ext
      })
    }
  },

  getSession(jso) {
    return new Promise((resolve, reject) => {
      const connection = this.props.settings.getIn(['servers', this.state.connection])
      const reference = this.props.referencesSummary[this.state.referenceIndex]
      const referenceFileName = reference['fileName']

      let s = new Session([], [], referenceFileName)
      let v, sequences
      
      // Ensure variants are there
      if (jso.variants && jso.variants.length > 0) {
        v = jso.variants
      } else {
        throw 'Provided JSON contains a session which does not list any variants. Consult help for instructions and examples of valid JSON batch files.'
      }

      sequences = jso.sequences || jso.bams || jso.crams || jso.files || jso.sequence_files

      // Ensure sequence files are there
      if (!sequences || sequences.length === 0) {
        throw 'Provided JSON contains a session which does not list any BAMs or CRAMs. Consult help for instructions and examples of valid JSON batch files.'
      }
      // If we have only a single sequence file, convert to array
      if(typeof sequences === 'string')
        sequences = [sequences]
      

      s.addVariants(v, connection).then(() => {
        return Promise.all(sequences.map(sequence => {
          console.log('sequences')
          console.log(sequence)
          return s.addSequenceFile(sequence, connection)
        }))
      }).then(() => {
        resolve(s)
      }).catch(error => {
        console.log(error)
        reject(error)
      })
    })
  },

  render() {
    console.log(this.state.sessions)

    let selectReferencePanelNode
    if (this.state.connection) {
      selectReferencePanelNode = (
        <SelectReferencePanel
          handleReferenceChange={this.handleReferenceChange}
          referencesSummary={this.props.referencesSummary}
        />
      )
    }


    let loadFilePanelNode
    console.log(this.state.referenceIndex)
    if (this.state.referenceIndex) {
      loadFilePanelNode = (
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
      )
    }
    
    let proceedNode
    if (this.state.sessions) {
      proceedNode = (
        <Pager>
          <PageItem next href='#' onClick={this.handleGoQC}>Proceed to QC &rarr;</PageItem>
        </Pager>
      )
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
                handleRemoteHTTPChange={this.handleRemoteHTTPChange}
              />
              {selectReferencePanelNode}
              {loadFilePanelNode}
              {proceedNode}
            </Col>
            <Col md={3}></Col>
          </Row>
        </Grid>
      </div>
    )
  }
})


module.exports = LoadBatch