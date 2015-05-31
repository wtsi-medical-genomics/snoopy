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

var FileLoader = require('./fileloader.jsx');
var getName = require('../utils.js').getName;




var LoadManual = React.createClass({

  handleVariantText: function(ftext, fpath) {
    session.variantFile = fpath;
    session.parseVariants(ftext);
  },

  render: function() {
    console.log('i am in loadmanul');
    return (
      <div>
        <Grid>
          <Row className='show-grid'>
            <Col md={2}></Col>
            <Col md={8}>
              <TitlePanel />
              <LoadVariantsPanel handleVariantText={this.handleVariantText}/>
              <LoadDataPanel />
              <Pager>
                <PageItem previous href='#'>&larr; Cancel, Return To Main Menu</PageItem>
              </Pager>
            </Col>
            <Col md={2}></Col>
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
  handleFileLoad(file) {
    console.log('call back in variant load');
    console.log(typeof(file));
    if (typeof(file) === 'object') {
      // a file object has been loaded
      file = file[0];
    } else {
      // a URL has been loaded
      var request = new XMLHttpRequest();
      request.open('GET', file, true);
      request.setRequestHeader('Content-Type', 'text/plain');
      request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
          // Success!
          console.log('in the request onload');
          console.log(request.responseText);
          this.props.handleVariantText(request.responseText, file);
        } else {
          // We reached our target server, but it returned an error
          console.log('oops');
        }
      }.bind(this);
      request.send('');
    }

      // jquery.ajax({
      //     url: file,
      //     contentType: 'text/plain',
      //     crossDomain: true
      //     //xhrFields: { withCredentials: true }
      // }).done(function(fileText) {
      //     console.log(fileText);
      //     //s.parseVariants(fileText);
      // }).fail(function(jqXHR, textStatus) {
      //     //this.renderFileLoadingErrorList('<strong>Error</strong>: Could not access variant file ' + v);
      //     console.log('it failed');
      // }.bind(this));
    // }
    // console.log(file);

  },
  render: function() {
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
            />
          }>
          <Button bsStyle="primary"><Glyphicon glyph="floppy-disk"/> Select Variant List</Button>
        </ModalTrigger>
        
      </Panel>
    );
  }

});

var LoadDataPanel = React.createClass({

  render: function() {
    return (
      <Panel>
        <h4>Select Sequence Data</h4>
        <p>
          Select BAM, BAI file containing a list of variants.
        </p>
          <ModalTrigger modal={
            <FileLoader
              title='Select Sequence Data'
              multiple={false}
              text='Using one of the following menas of file access, select your BAMs view. Note that for local BAM files, BAIs will also need to be loaded.'
            />
          }>
          <Button bsStyle="primary"><Glyphicon glyph="floppy-disk"/> Select Sequence Data</Button>
        </ModalTrigger>
        
      </Panel>
    );
  }

});

module.exports = LoadManual;