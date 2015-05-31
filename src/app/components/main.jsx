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

var LoadManual = require('./loadmanual.jsx'); 
var QC = require('./qc.jsx');

var Main = React.createClass({
  
  getInitialState() {
    return {view: 'qc'};
  },

  render() {
    var Child;
    switch (this.state.view) {
      case 'intro': Child = Intro; break;
      case 'loadmanual': Child = LoadManual; break;
      case 'qc': Child = QC; break;
      default:      Child = Intro;
    }

    return (
      <div>
        <MainToolbar view={this.state.view} />
        <Child />
      </div>
    );
  },

});

var Intro = React.createClass({
  render() {
    return (
      <div>
        <Grid>
          <Row className='show-grid'>
            <Col md={2}></Col>
            <Col md={8}>
              <IntroPanel />
              <ManualPanel />
              <BatchPanel />
            </Col>
            <Col md={2}></Col>
          </Row>
        </Grid>
      </div>
    );
  }

});


var MainToolbar = React.createClass({

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

var IntroPanel = React.createClass({

  render() {
    return (
      <Panel>
      <h4>Welcome to Snoopy</h4>
        <p>
          Snoopy is a quality control tool to review predicted variants in BAM files using the Dalliance genome browser. There are a few ways to use this tool:
        </p>
      </Panel>
    );
  }

});


var ManualPanel = React.createClass({

  render() {
    var style = {
      backgroundColor: '#D5EBF6'
    };

    return (
      <Panel style={style}>
        <h4>Manual</h4>
          <p>
            This mode is used when you want to manually add files from your local machine or from a server. Using Snoopy in this way will limit you to only one variant file.
          </p>
          <Button bsStyle="primary">Go Manual<Glyphicon glyph="chevron-right"/></Button>
      </Panel>
    );
  }

});


var BatchPanel = React.createClass({

  render() {
    var panelStyle = {
      backgroundColor: '#EEFFEB'
    };

    return (
      <Panel style={panelStyle}>
        <h4>Manual</h4>
          <p>
            In this mode you have a file prepared that lists multiple “sessions”. Each session consists of a remote file listing variants along with a collection of remote BAM files.
          </p>
          <Button bsStyle="success">Go Batch<Glyphicon glyph="chevron-right"/></Button>
      </Panel>
    );
  }

});


module.exports = Main;