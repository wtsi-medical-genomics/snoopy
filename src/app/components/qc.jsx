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

    var b = new Browser({
      chr:          '18',
      viewStart:    117141,
      viewEnd:      117341,
      // chr:          '16',
      // viewStart:    48000629,
      // viewEnd:      48000820,
      // noPersistView : true,
      cookieKey:    'human-grc_h37',
      coordSystem: {
        speciesName: 'Human',
        taxon: 9606,
        auth: 'GRCh',
        version: '37',
        ucscName: 'hg19'
      },
      maxHeight : 10000,
      setDocumentTitle: true,
      //uiPrefix: window.location.origin + '/',
      fullScreen: true,
      disableDefaultFeaturePopup : true,
      noPersist : true,
      maxWorkers : 3,
      baseColors: {
        A: 'green', 
        C: 'blue', 
        G: 'orange', 
        T: 'red',
        '-' : 'black', // deletion
        I : 'mediumpurple' // insertion
      },
      sources: [
        {
          name: 'Genome',
          twoBitURI: 'http://www.biodalliance.org/datasets/hg19.2bit',
          tier_type: 'sequence',
          provides_entrypoints: true,
          pinned: true
        }
      ]
    });
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

  render() {

      return (
        <Navbar toggleNavKey={0} className='QCToolbar'>
          <Nav eventKey={0}>
            <NavItem eventKey={2} href='#'><Button>chr16:233423</Button></NavItem>
            <NavItem eventKey={1} href='#'><Button><Glyphicon glyph='home' /></Button></NavItem>
            <NavItem eventKey={2} href='#'><Button><Glyphicon glyph="chevron-left"/>Previous</Button></NavItem>
            <NavItem eventKey={3} href='#'><Button>Not a Variant<Glyphicon glyph="chevron-right"/></Button></NavItem>
            <NavItem eventKey={4} href='#'><Button>Uncertain<Glyphicon glyph="chevron-right"/></Button></NavItem>
            <NavItem eventKey={5} href='#'><Button>Variant<Glyphicon glyph="chevron-right"/></Button></NavItem>
          </Nav>
        </Navbar>   
      );    
  }
                    // <button type="button" class="btn btn-default qc-decision" id="buttonQCNotVariant" data-value="not variant">Not a Variant <span class="glyphicon glyphicon-chevron-right"></span></button>
                    // <button type="button" class="btn btn-default qc-decision" id="buttonQCPotentialVariant" data-value="uncertain">Uncertain <span class="glyphicon glyphicon-chevron-right"></span></button>
                    // <button type="button" class="btn btn-default qc-decision" id="buttonQCCertainVariant"  data-value="variant">Variant <span class="glyphicon glyphicon-chevron-right"></span></button>
});

module.exports = QC;