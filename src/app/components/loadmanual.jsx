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

var FileLoader = require('./fileloader.jsx');
var getName = require('../utils.js').getName;

var session = require('../session.js');
var Session = session.Session;
var Sessions = session.Sessions;

var lft = require('../loadedfiletypes.js');
var LocalBAM = lft.LocalBAM;
var LocalBAI = lft.LocalBAI;
var RemoteBAM = lft.RemoteBAM;
var RemoteBAI = lft.RemoteBAI;



var LoadManual = React.createClass({

  getInitialState() {
    return {session: new Session()};
  },

  handleVariantText(ftext, fpath) {
    var s = this.state.session;
    s.variantFile = fpath;
    s.parseVariants(ftext);
    this.setState({session: s});
  },

  handleDataFile(files) {
    var s = this.state.session;
    s.addBam(files);
    this.setState({session: s});
    console.log(s);
  },

  handleRemoveDataFile(id) {
    var s = this.state.session;
    s.remove(id);
    this.setState({session: s});
  },

  handleGoQC(e) {
    e.preventDefault();
    var s = new Sessions();
    s.sessions[0] = this.state.session;
    this.props.handleGoQC(s);
  },

  handleGoBack(e) {
    e.preventDefault();
    this.props.handleGoIntro();
  },

  render() {
    return (
      <div>
        <Grid>
          <Row className='show-grid'>
            <Col md={3}></Col>
            <Col md={6}>
              <TitlePanel />
              <LoadVariantsPanel
                handleVariantText={this.handleVariantText}
                session={this.state.session}
                settings={this.props.settings}
              />
              <LoadDataPanel
                handleDataFile={this.handleDataFile}
                session={this.state.session}
                handleRemoveDataFile={this.handleRemoveDataFile}
                settings={this.props.settings}
              />
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
        <h4>Manual Mode</h4>
      </Panel>
    );
  }

});

var LoadVariantsPanel = React.createClass({
  handleFileLoad(file, credentials) {
    console.log(typeof(file));
    if (typeof(file) === 'object') {
      // a file object has been loaded
      file = file[0];
      var reader = new FileReader();
      reader.readAsText(file);
      reader.onload = () => {
        this.props.handleVariantText(reader.result, '(local) ' + file.name);
          // sessionInstance.load(reader.result);
      };
    } else {
      // a URL has been loaded
      var request = new XMLHttpRequest();
      request.open('GET', file, true);
      request.setRequestHeader('Content-Type', 'text/plain');
      request.withCredentials = true;
      request.onload = () => {
        if (request.status >= 200 && request.status < 400) {
          // Success!
          console.log('in the request onload');
          console.log(request.responseText);
          this.props.handleVariantText(request.responseText, file);
        } else {
          // We reached our target server, but it returned an error
          console.log('oops');
        }
      };
      request.send('');
    }
  },
  render: function() {
    var tableStyle = {
      'width': '100%'
    };

    if (this.props.session.variants.length && this.props.session.variantFile) {
      var variantNode = (
        <ListGroup className='someTopMargin'>
          <ListGroupItem bsStyle='success'>
            <table style={tableStyle}>
              <tr>
                <td><b>{this.props.session.variantFile}</b></td>
                <td>n = {this.props.session.variants.length}</td>
              </tr>
            </table>
          </ListGroupItem>
        </ListGroup>
      );
    }

    return (
      <Panel>
        <h4>Select Variant File</h4>
        <p>
          Select a text file containing a list of variants.
        </p>
        
        <ModalTrigger modal={
            <FileLoader
              title='Select Variant List File'
              multiple={false}
              text='Using one of the following menas of file access, select a single text file containing a list of variants.'
              handleFileLoad={this.handleFileLoad}
              allowedExtensions={['txt']}
              settings={this.props.settings}
            />
          }>
          <Button bsStyle="primary"><Glyphicon glyph="floppy-disk"/> Select Variant List</Button>
        </ModalTrigger>
        {variantNode}
      </Panel>
    );
  }

});

var IndexMessage = React.createClass({
  
  render() {
    if (this.props.file instanceof LocalBAM) {
      if (this.props.file.index) {
        return (<div><Glyphicon glyph='thumbs-up' /> Local Index Loaded</div>);
      }
      else {
        return (<div><Glyphicon glyph='exclamation-sign' /> Needs Local Index</div>);
      }
    } else {
      return null
    }
  }
});

var DataFileRow = React.createClass({
  
  handleRemove(e) {
    e.preventDefault();
    console.log(this.props);
    this.props.handleRemove(this.props.file.id);
  },

  render() {
    var indexMessage;
    if (this.props.file instanceof LocalBAM) {
      if (this.props.file.index) {
        indexMessage = (<div><td></td><td>Local Index Loaded</td></div>);
      }
      else {
        indexMessage = (<div><td><Glyphicon glyph='warning-sign' /></td><td>Needs Local Index</td></div>);
      }
    } else {
      indexMessage = (<div><td></td><td></td></div>);
    }


    return (
      <tr>
        <td><a href="#" onClick={this.handleRemove}><Glyphicon glyph='remove-sign' /></a></td>
        <td><b>{this.props.file.name}</b></td>
        <td>{indexMessage}</td>
      </tr>
    );
  }
});

var LoadDataPanel = React.createClass({
  handleFileLoad(files, credentials) {
    // console.log(this.props);
    // if (typeof(files) === 'string') {
    //   // we have a URL so test if the file exists before adding it to a session
    //   var URL = files;
    //   var request = new XMLHttpRequest();
    //   request.open('GET', URL, true);

    //   //request.setRequestHeader('Content-Type', 'text/plain');
    //   //request.withCredentials = true;
    //   request.onload = () => {
    //     if (request.status >= 200 && request.status < 400) {
    //       // Success!
    //       console.log('in the request onload');
    //       console.log(request.responseText);
    //       this.props.handleVariantText(request.responseText, file);
    //     } else {
    //       // We reached our target server, but it returned an error
    //       console.log('oops');
    //     }
    //   };
    //   request.send('');
    // } 

    //   typeof(file) === 'object') {
    //   // a file object has been loaded
    //   file = file[0];
    //   var reader = new FileReader();
    //   reader.readAsText(file);
    //   reader.onload = () => {
    //     this.props.handleVariantText(reader.result, '(local) ' + file.name);
    //       // sessionInstance.load(reader.result);
    //   };
    // } else {
    this.props.handleDataFile(files, credentials);
    // console.log(files);
    // console.log(credentials);
  },
  handleRemove(key) {
    console.log(key);
    this.props.handleRemoveDataFile(key);
  },
  compare(a,b) {
    if (a.name < b.name)
      return -1;
    if (a.name > b.name)
      return 1;
    return 0;
  },
  render() {
    var tableStyle = {
      'width': '100%'
    };

    var fileNodes;
    if (this.props.session.bamFiles.length + this.props.session.baiFiles.length) {
      var files = this.props.session.bamFiles.concat(this.props.session.baiFiles);
      var files = files.sort(this.compare);
      var fileRows = files.map((file) => {
        return <DataFileRow file={file} key={file.id} handleRemove={this.handleRemove} />
      });
      console.log(files);
      fileNodes = (
        <ListGroup className='someTopMargin'>
          <ListGroupItem bsStyle='success'>
            <table style={tableStyle}>
              <tbody>
                {fileRows}
              </tbody>
            </table>
          </ListGroupItem>
        </ListGroup>
      );
    };

    // if (this.props.session.baiFiles.length) {
    //   var baiRows = this.props.session.baiFiles.map((baiFile) => {
    //     console.log(baiFile);
    //     return <DataFileRow file={baiFile} key={baiFile.id} handleRemove={this.handleRemove} />
    //   });

    //   var baiNodes = (
    //     <ListGroup className='someTopMargin'>
    //       <ListGroupItem bsStyle='success'>
    //         <table style={tableStyle}>
    //           {baiRows}
    //         </table>
    //       </ListGroupItem>
    //     </ListGroup>
    //   );
    // }

    return (
      <Panel>
        <h4>Select Sequence Data</h4>
        <p>
          Select BAM, BAI file containing a list of variants.
        </p>
          <ModalTrigger modal={
            <FileLoader
              title='Select Sequence Data'
              multiple={true}
              text='Using one of the following menas of file access, select the BAMs you wish to view. Note that for local BAM files, BAIs will also need to be loaded.'
              handleFileLoad={this.handleFileLoad}
              allowedExtensions={['bam', 'bam.bai', 'bai']}
              settings={this.props.settings}
            />
          }>
          <Button bsStyle="primary"><Glyphicon glyph="floppy-disk"/> Select Sequence Data</Button>
        </ModalTrigger>
        {fileNodes}
      </Panel>
    );
  }

});

module.exports = LoadManual;