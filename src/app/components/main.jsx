/** In this file, we create a React component which incorporates components provided by material-ui */

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
var Main = React.createClass({
  
  getInitialState: function() {
    return {view: 'intro'};
  },

  render: function() {
    const title = (
      <h3>Panel title</h3>
    );

    return (
      <div>
      <MainToolbar view={this.state.view} />
        <Grid>
          <Row className='show-grid'>
            <Col md={2}></Col>
            <Col md={8}>
              <IntroPanel />
            </Col>
            <Col md={2}></Col>
          </Row>
        </Grid>
      </div>
    );
  },

});

var MainToolbar = React.createClass({

  render: function() {
    if (this.props.view === 'intro') {
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
  }

});

var IntroPanel = React.createClass({

  render: function() {
    return (
      <Panel>
      <h4>Welcome to Snoopy</h4>
        <p className="justify">
          Snoopy is a quality control tool to review predicted variants in BAM files using the Dalliance genome browser. There are a few ways to use this tool:
        </p>
      </Panel>
    );
  }

})


module.exports = Main;