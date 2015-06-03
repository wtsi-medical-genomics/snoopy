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
    inputs[this.state.key] = input
    this.setState({inputs: inputs})
  },

  handleSubmit() {
    console.log('here!');
    //make sure that the current tabs input has all been loaded.
    
    var input = this.state.inputs[this.state.key];
    var errors = [];
    var url;

    switch (this.state.key) {
      //HTTP/S
      case 0:
        if (input.server === '') {
          errors.push('Please enter a server location.');
        }
        if (input.path === '') {
          errors.push('Please enter a path to your file.');
        }
        if (errors.length === 0) {
          url = input.server + input.path;
          opts = {};
        }
        break;
    }

    if (errors.length === 0) {
      this.props.handleFileLoad(url, opts);
    } else{
      console.log(input);
      console.log(errors);
      this.setState({errors:errors});
    }
    //this.props.onRequestHide();


    

    //this.props.handleFileLoad('http://127.0.0.1:8000/examples/variants.txt');

  },

  render() {
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
                <HTTPTab handleInputChange={this.handleInputChange} handleSubmit={this.handleSubmit}/>
              </TabPane>
              <TabPane eventKey={1} tab='Local File'>
                <LocalFileTab multiple={this.props.multiple} handleInputChange={this.handleInputChange}/>
              </TabPane>
              <TabPane eventKey={2} tab='Local Server'>
                <LocalServerTab handleInputChange={this.handleInputChange}/>
              </TabPane>
              <TabPane eventKey={3} tab='SSH Bridge'>
                <SSHTab handleInputChange={this.handleInputChange} handleSubmit={this.handleSubmit}/>
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
  handleInputChange() {
    this.props.handleInputChange(
      {server: this.refs.server.getValue().trim(),
       path: this.refs.path.getValue().trim()
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
        <form role="form" onSubmit={this.handleSubmit}>
          <Input type="text" ref="server" label="HTTP Server Location" placeholder="The URL of the server" onChange={this.handleInputChange}/>
          <Input type="text" ref="path" label="Path to file on server" placeholder="path to file" onChange={this.handleInputChange}/>
        </form>
      </div>
    );
  }
});

var LocalFileTab = React.createClass({
  
  handleInputChange() {
    var files = React.findDOMNode(this.refs.file).files;
    this.props.handleInputChange(files);
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
          <Input type="text" label="Local HTTP Server" labelClassName="col-md-4" wrapperClassName="col-md-8" placeholder="The local server that bridges to the remote server" />
          <Input type="text" label="Remote SSH Server" labelClassName="col-md-4" wrapperClassName="col-md-8" placeholder="The remote SSH server that stores your files" />
          <Input type="text" label="Username @ SSH Server" labelClassName="col-md-4" wrapperClassName="col-md-8" placeholder="Your username to login to the remote SSH server" />
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