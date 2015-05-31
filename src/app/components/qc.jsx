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

var QC = React.createClass({
  
  render() {
    return (
      <QCToolbar />
    );
  }

});


var QCToolbar = React.createClass({

  render() {
      return (
        <Navbar brand='Snoopy' inverse toggleNavKey={0}>
          <Nav right eventKey={0}> {/* This is the eventKey referenced */}
            <NavItem eventKey={1} href='#'>Settings</NavItem>
            <NavItem eventKey={2} href='#'>Help</NavItem>
            <NavItem eventKey={2} href='#'>About</NavItem>
            <NavItem eventKey={2} href='#'>GitHub</NavItem>
          </Nav>
        </Navbar>      
      );    
  }

});

module.exports = QC;