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
var ModalTrigger = rb.ModalTrigger;
var LoadManual = require('./loadmanual.jsx');
var LoadBatch = require('./loadbatch.jsx');
var QC = require('./qc.jsx');
var Settings = require('./settings.jsx');
var SettingsModal = Settings.SettingsModal;

var Main = React.createClass({  

  getInitialState() {
    return {
      view: 'intro',  //intro, loadmanual, loadbatch, qc
      settings: {}
    };
  },

  componentDidMount() {
    Settings.init((settings) => {
      this.setState({settings: settings});
    });
  },

  handleSettings(settings) {
    this.setState({settings: settings})
  },

  handleGoManual() {
    this.setState({view: 'loadmanual'});
  },

  handleGoBatch() {
    this.setState({view: 'loadbatch'});
  },

  handleGoQC(sessions) {
    this.setState({view: 'qc', sessions: sessions});
  },

  handleGoIntro() { 
    this.setState({view: 'intro'});
  },

  render() {
    var child;
    switch (this.state.view) {
      case 'intro':
        child = <Intro handleGoManual={this.handleGoManual}  handleGoBatch={this.handleGoBatch} />;
        break;
      case 'loadmanual':
        child = <LoadManual handleGoQC={this.handleGoQC} handleGoIntro={this.handleGoIntro} settings={this.state.settings} />;
        break;
      case 'loadbatch':
        child = <LoadBatch handleGoQC={this.handleGoQC} handleGoIntro={this.handleGoIntro}  settings={this.state.settings} />;
        break;
      case 'qc':
        child = <QC sessions={this.state.sessions} settings={this.state.settings} />;
        break;
      default:
        child = <Intro />;
    }
    console.log(this.state.settings);
    return (
      <div className="outerWrapper">
        <MainToolbar view={this.state.view} settings={this.state.settings} handleSettings={this.handleSettings} />
        {child}
      </div>
    );
  },

});

var Intro = React.createClass({

  render() {
    return (
      <div className="innerWrapper">
        <Grid>
          <Row className='show-grid'>
            <Col md={3}></Col>
            <Col md={6}>
              <IntroPanel />
              <ManualPanel handleGoManual={this.props.handleGoManual} />
              <BatchPanel  handleGoBatch={this.props.handleGoBatch} />
            </Col>
            <Col md={3}></Col>
          </Row>
        </Grid>
      </div>
    );
  }

});


var MainToolbar = React.createClass({

  handleGitHub(e) {
    e.preventDefault();
    var newTab = window.open('https://github.com/wtsi-medical-genomics/snoopy', '_blank');
    if(newTab)
        newTab.focus();
    else
        alert('Please allow popups for this site.');
  },

  render() {
      return (
        <Navbar brand='Snoopy' inverse toggleNavKey={0}>
          <Nav right eventKey={0}> {/* This is the eventKey referenced */}
            <ModalTrigger modal={<SettingsModal settings={this.props.settings} handleSettings={this.props.handleSettings}/>}>
              <NavItem eventKey={1} href='#'>Settings</NavItem>
            </ModalTrigger>
            <NavItem eventKey={2} href='#'>Help</NavItem>
            <NavItem eventKey={3} href='#' onClick={this.handleGitHub}>GitHub</NavItem>
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

  handleClick(e) {
    e.preventDefault();
    this.props.handleGoManual();
  },

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
          <Button bsStyle="primary" onClick={this.handleClick}>Go Manual<Glyphicon glyph="chevron-right"/></Button>
      </Panel>
    );
  }

});


var BatchPanel = React.createClass({
  
  handleClick(e) {
    e.preventDefault();
    this.props.handleGoBatch();
  },

  render() {
    var panelStyle = {
      backgroundColor: '#EEFFEB'
    };

    return (
      <Panel style={panelStyle}>
        <h4>Batch</h4>
          <p>
            In this mode you have a file prepared that lists multiple “sessions”. Each session consists of a remote file listing variants along with a collection of remote BAM files.
          </p>
          <Button bsStyle="success" onClick={this.handleClick}>Go Batch<Glyphicon glyph="chevron-right"/></Button>
      </Panel>
    );
  }

});


module.exports = Main;