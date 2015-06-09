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
var browser;

var QC = React.createClass({

  componentDidMount() {

    console.log(this.props.sessions);
    //this.props.sessions.loadDalliance();
    browser = new Browser({
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
      })
      browser.addInitListener(() => {
        // this.index = 0;
        // this.props.sessions[this.index].index = 0;
        // this.sessions[this.state.sessionIndex].browser = this.browser;
        console.log(this.props.sessions);
        this.props.sessions.init(browser);
        this.props.sessions.gotoCurrentVariant(browser);
        // this.props.sessions.sessions[0].getTier()
        // var loc = this.props.sessions.sessions[0].variants[0].getLocation();
        // var hlr = this.props.sessions.sessions[0].variants[0].getHighlightRegion();
        // browser.highlightRegion(loc.chr, loc.min, loc.max);
        // browser.setCenterLocation(hlr.chr, hlr.min, hlr.max);


    });
    // this.props.sessions.init();
    

  },

  render() {
    return (
      <div>
        <QCToolbar sessions={this.props.sessions}/>
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
  
  getInitialState() {
    console.log('in getInitialState in QCToolbar');
    return {
      currentVariant: this.props.sessions.getCurrentVariant()
    };
  },

  // nextVariant() {
  //   console.log('jhere!!');
  //   var i = this.sessions.next(browser);
  //   this.setState({sessionIndex: i.si, variantIndex: i.vi});
  // },
  nextVariant() {
    this.setState({currentVariant: this.props.sessions.next(browser)});
  },

  handleVariantList(e) {
    e.preventDefault();
    // var score = settings.score.variant;
    console.log('handleVariant');
    var score = 'variant';
    this.props.sessions.setQC(score);
    this.nextVariant();
  },

  handleHome(e) {
    e.preventDefault();
    // var score = settings.score.variant;
    console.log('handleVariant');
    var score = 'variant';
    this.props.sessions.setQC(score);
    this.nextVariant();
  },

  handlePrevious(e) {
    e.preventDefault();
    // var score = settings.score.variant;
    console.log('handlePrevious');
    var previousVariant = this.props.sessions.previous(browser);
    if (previousVariant) {
      this.setState({currentVariant: previousVariant});
    } else {
      console.log('already at the beginning');
    }
  },

  handleQC(decision, e) {
    console.log(decision);
    e.preventDefault();
    // var score = settings.score.variant;
    console.log('handleVariant');
    this.props.sessions.setQC(decision);
    this.nextVariant();
  },

  render() {

      return (
        <Navbar toggleNavKey={0} className='QCToolbar'>
          <Nav eventKey={0}>
            <NavItem eventKey={1} href='#' onClick={this.handleVariantList}><Button>chr16:233423</Button></NavItem>
            <NavItem eventKey={2} href='#' onClick={this.handleHome}><Button><Glyphicon glyph='home' /></Button></NavItem>
            <NavItem eventKey={3} href='#' onClick={this.handlePrevious}><Button><Glyphicon glyph="chevron-left"/>Previous</Button></NavItem>
            <NavItem eventKey={4} href='#' onClick={this.handleQC.bind(this, 'not variant')}><Button>Not a Variant<Glyphicon glyph="chevron-right"/></Button></NavItem>
            <NavItem eventKey={5} href='#' onClick={this.handleQC.bind(this, 'uncertain')}><Button>Uncertain<Glyphicon glyph="chevron-right"/></Button></NavItem>
            <NavItem eventKey={6} href='#' onClick={this.handleQC.bind(this, 'variant')}><Button>Variant<Glyphicon glyph="chevron-right"/></Button></NavItem>
          </Nav>
        </Navbar>   
      );    
  }
                    // <button type="button" class="btn btn-default qc-decision" id="buttonQCNotVariant" data-value="not variant">Not a Variant <span class="glyphicon glyphicon-chevron-right"></span></button>
                    // <button type="button" class="btn btn-default qc-decision" id="buttonQCPotentialVariant" data-value="uncertain">Uncertain <span class="glyphicon glyphicon-chevron-right"></span></button>
                    // <button type="button" class="btn btn-default qc-decision" id="buttonQCCertainVariant"  data-value="variant">Variant <span class="glyphicon glyphicon-chevron-right"></span></button>
});

module.exports = QC;