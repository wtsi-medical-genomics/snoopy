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
  componentDidMount() {

    console.log(this.props.sessions);
    //this.props.sessions.loadDalliance();
    this.props.sessions.init();
    
  },

  render() {
    return (
      <div>
        <QCToolbar />
        <DallianceHolder />
      </div>
    );
  }

});


var DallianceHolder = React.createClass({

  render() {
    var style = {
      backgroundColor: 'white',
      border: '4px solid darkcyan'
    }
    return (
        <div id="svgHolder" style={style}></div>
    );
  }

});

var QCToolbar = React.createClass({

  handleVariant() {

  },

  render() {

      return (
        <Navbar toggleNavKey={0} className='QCToolbar'>
          <Nav eventKey={0}>
            <NavItem eventKey={2} href='#'><Button>chr16:233423</Button></NavItem>
            <NavItem eventKey={1} href='#'><Button><Glyphicon glyph='home' /></Button></NavItem>
            <NavItem eventKey={2} href='#'><Button><Glyphicon glyph="chevron-left"/>Previous</Button></NavItem>
            <NavItem eventKey={3} href='#'><Button>Not a Variant<Glyphicon glyph="chevron-right"/></Button></NavItem>
            <NavItem eventKey={4} href='#'><Button>Uncertain<Glyphicon glyph="chevron-right"/></Button></NavItem>
            <NavItem eventKey={5} href='#' handleClick={this.handleVariant}><Button>Variant<Glyphicon glyph="chevron-right"/></Button></NavItem>
          </Nav>
        </Navbar>   
      );    
  }
                    // <button type="button" class="btn btn-default qc-decision" id="buttonQCNotVariant" data-value="not variant">Not a Variant <span class="glyphicon glyphicon-chevron-right"></span></button>
                    // <button type="button" class="btn btn-default qc-decision" id="buttonQCPotentialVariant" data-value="uncertain">Uncertain <span class="glyphicon glyphicon-chevron-right"></span></button>
                    // <button type="button" class="btn btn-default qc-decision" id="buttonQCCertainVariant"  data-value="variant">Variant <span class="glyphicon glyphicon-chevron-right"></span></button>
});

module.exports = QC;