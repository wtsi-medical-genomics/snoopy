var React = require('react');
var rb = require('react-bootstrap');
var Alert = rb.Alert;
var Panel = rb.Panel;
var Nav = rb.Nav;
var Navbar = rb.Navbar;
var NavItem = rb.NavItem;
var MenuItem = rb.MenuItem;
var DropdownButton = rb.DropdownButton;
var Col = rb.Col;
var Row = rb.Row;
var Grid = rb.Grid;
var Button = rb.Button;
var Glyphicon = rb.Glyphicon;
var Pager = rb.Pager;
var PageItem = rb.PageItem;

var LoadManual = React.createClass({
  
  render: function() {
    console.log('i am in loadmanul');
    return (
      <div>
        <Grid>
          <Row className='show-grid'>
            <Col md={2}></Col>
            <Col md={8}>
              <Pager>
                <PageItem previous href='#'>&larr; Go Back</PageItem>
              </Pager>
              <TitlePanel />
              <LoadVariantsPanel />
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

  render: function() {
    return (
      <Panel>
        <h4>Load Variant File</h4>
        <p>
          Select a text file containing a list of variants.
        </p>
        <Button bsStyle="primary"><Glyphicon glyph="floppy-disk"/> Select Variant List</Button>
      </Panel>
    );
  }

});


module.exports = LoadManual;