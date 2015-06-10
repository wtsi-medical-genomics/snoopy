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

var settings = require('./settings.jsx').settings;


var FileLoader = React.createClass({  
  getInitialState() {
    return {
      key: 0,
      inputs: [],
      errors: []
    };
  },

  handleSelect(key) {
    this.setState({key: key, errors: []});
  },

  handleInputChange(input) {
    var inputs = this.state.inputs;
    inputs[this.state.key] = input;
    this.setState({inputs: inputs});
    console.log(input);
  },

  handleSubmit() {
    console.log('here!');
    //make sure that the current tabs input has all been loaded.
    
    var input = this.state.inputs[this.state.key];
    var errors = [];
    var file;
    var credentials;
    switch (this.state.key) { //['HTTP/S', 'Local', 'Local Server', 'SSH Bridge'];
      //HTTP/S
      case 0:
        if (input.server === '') {
          errors.push('Please enter a server location.');
        }
        if (input.path === '') {
          errors.push('Please enter a path to your file.');
        }
        if (!arrayStringContains(getExtension(input.path), this.props.allowedExtensions)) {
          errors.push('File must have extension: ' + this.props.allowedExtensions.join(', '));
        }
        if (errors.length === 0) {
          file = combineServerPath(input.server, input.path);
          credentials = input.credentials;
          if (!httpExists(file, credentials)) {
            errors.push('Unable to access: ' + file);
          }
        }
        break;
      case 1:
        for (var i=0; i<input.files.length; ++i) {
          var f = input.files[i];
          if (!arrayStringContains(getExtension(f.name), this.props.allowedExtensions)) {
            errors.push(file.name + ': File must have extension: ' + this.props.allowedExtensions.join(', '));
          }
        }
        if (errors.length === 0) {
          file = input.files;
        }
    }

    if (errors.length === 0) {
      this.props.handleFileLoad(file, credentials);
      this.props.onRequestHide();
    } else{
      console.log(input);
      console.log(errors);
      this.setState({errors:errors});
    }

    //this.props.handleFileLoad('http://127.0.0.1:8000/examples/variants.txt');

  },

  render() {
    console.log(settings);
    var labels = ['HTTP/S', 'Local', 'Local Server', 'SSH Bridge'];
    var loadButtonText = 'Load ' + labels[this.state.key] + ' File';
    var alertInstance;
    console.log(this.state.errors.length);
    if (this.state.errors.length > 0) {
      var errors = this.state.errors.map((error, index) => {
        return (<li key={index}>{error}</li>);
      });
      alertInstance = (
        <Alert bsStyle='danger'>
          <ul>{errors}</ul>
        </Alert>
      );
    }

    return (
      <div>
        <Modal {...this.props} title={this.props.title} animation={false}>
          <div className='modal-body'>
            <p>{this.props.text}</p>
            <TabbedArea activeKey={this.state.key} animation={false} onSelect={this.handleSelect}>
              <TabPane eventKey={0} tab='HTTP/S'>
                <HTTPTab handleInputChange={this.handleInputChange} handleSubmit={this.handleSubmit} settings={this.props.settings}/>
              </TabPane>
              <TabPane eventKey={1} tab='Local File'>
                <LocalFileTab multiple={this.props.multiple} handleInputChange={this.handleInputChange} settings={this.props.settings}/>
              </TabPane>
              <TabPane eventKey={3} tab='SSH Bridge'>
                <SSHTab handleInputChange={this.handleInputChange} handleSubmit={this.handleSubmit} settings={this.props.settings}/>
              </TabPane>
            </TabbedArea>
            {alertInstance}
          </div>
          <div className='modal-footer'>
            <Button bsStyle="primary" onClick={this.handleSubmit}>{loadButtonText}</Button>
            <Button onClick={this.props.onRequestHide}>Close</Button>
          </div>
        </Modal>
      </div>
    );
  }
});


var HTTPTab = React.createClass({
  // this.props.handleCheckbox(value, e) {

  // },
  handleInputChange() {
    this.props.handleInputChange(
      {server: this.refs.server.getValue().trim(),
       path: this.refs.path.getValue().trim(),
       credentials: this.refs.credentials.getChecked()
      }
    ); 
  },
  componentDidMount() {
    this.handleInputChange();
  },
  render() {
    return (
      <div>
        <p>Load a file that resides on a remote server and can be accessed via HTTP/S.</p>
        <form role="form" onSubmit={this.handleSubmit} onChange={this.handleInputChange}>
          <Input type="text" 
            ref="server"
            label="HTTP Server Location"
            placeholder="The URL of the server"
            defaultValue={this.props.settings.servers.remoteHTTP.location} />
          <Input type="text"
            ref="path"
            label="Path to file on server"
            placeholder="path to file" />
          <Input type="checkbox"
            ref="credentials"
            label="Requires credentials"
            defaultChecked={this.props.settings.servers.remoteHTTP.requiresCredentials}/>
        </form>
      </div>
    );
  }
});

var LocalFileTab = React.createClass({
  
  handleInputChange() {
    var files = React.findDOMNode(this.refs.file).files;
    this.props.handleInputChange({files: files});
  },  
  render() {
    if (this.props.multiple)
      var input = (<input type="file" ref="file" multiple onChange={this.handleInputChange}/>);
    else
      var input = (<input type="file" ref="file" onChange={this.handleInputChange}/>);

    return (
      <div>
        <p>Load a file that exists on your local machine (e.g. hard drive).</p>
        {input}
      </div>
    );
  }
});


var LocalServerTab = React.createClass({
  handleInputChange() {
    this.props.handleInputChange(this.refs.path.getValue());
  },
  handleSubmit(e) {
    e.preventDefault();
    this.props.handleSubmit();
  },
  render() {
    return (
      <div>
        <p>Load a file that exists on a local server that you have started.</p>
        <form role="form" onSubmit={this.handleSubmit}>
          <Input type="text" label="Local HTTP Server" placeholder="The local server that bridges to the remote server" />
          <Input type="text" ref="path" label="Path to file on server" placeholder="path to file" onChange={this.handleInputChange}/>
        </form>
      </div>
    );
  }
});

var SSHTab = React.createClass({
  handleInputChange() {
    this.props.handleInputChange(this.refs.path.getValue());
  },
  handleSubmit(e) {
    e.preventDefault();
    this.props.handleSubmit();
  },
  render() {
    return (
      <div>
        <p>Load a file that exists on a local server that cannot be accessed via HTTP/S but can be accessed via SSH. To use this option, an ssh-bridge server must have been started on your local machine.</p>
        <form className="form-horizontal">
          <Input type="text"
            label="Local HTTP Server"
            labelClassName="col-md-4"
            wrapperClassName="col-md-8"
            placeholder="The local server that bridges to the remote server"
            defaultValue={this.props.settings.servers.SSHBridge.localHTTPServer} />
          <Input type="text"
            label="Remote SSH Server"
            labelClassName="col-md-4"
            wrapperClassName="col-md-8"
            placeholder="The remote SSH server that stores your files" 
            defaultValue={this.props.settings.servers.SSHBridge.remoteSSHServer} />
          <Input type="text"
            label="Username @ SSH Server"
            labelClassName="col-md-4"
            wrapperClassName="col-md-8"
            placeholder="Your username to login to the remote SSH server" 
            defaultValue={this.props.settings.servers.SSHBridge.username} />
        </form>
        <form role="form" onSubmit={this.handleSubmit}>
          <Input type="text" ref="path" label="Path to file on server" placeholder="path to file" onChange={this.handleInputChange}/>
        </form>
      </div>
    );
  }
});

//   id:'localMachine',
          //   tabText: 'Local Machine',
          //   URL: false,
          //   bodyText: 'Load a file that exists on your local machine (e.g. hard drive).'
          // },
          // {
          //   id:'localServer',
          //   tabText: 'Local Server',
          //   URL: '127.0.0.1',
          //   bodyText: 'Load a file that exists on a local server that you\'ve started.'
          // },
          // {
          //   id:'SSH',
          //   tabText: 'SSH Bridge',
          //   URL: 'dr9@farm3-login:',
          //   bodyText: 'Load a file that exists on a local server that cannot be accessed via HTTP/S but can be accessed via SSH. To use this option, an ssh-bridge server must have been started on your local machine.'
          // }



module.exports = FileLoader;