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

var SessionsModal = require('./sessionsmodal.jsx');
var JSZip = require('JSZip');
var saveAs = require('filesaver.js');

var browser;
var zip = new JSZip();
var imageFolder = zip.folder('images');


var QC = React.createClass({

  componentDidMount() {
    console.log('in QC componentDidMount');
    console.log(this.props.sessions);
    //this.props.sessions.loadDalliance();
    browser = new Browser({
      chr:          '16',
      viewStart:    48000181,
      viewEnd:      48000381,
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
        
        var style = this.props.settings.styles.condensed.styles;
        this.props.sessions.init(browser, style);
        this.props.sessions.gotoCurrentVariant(browser);

        // this.props.sessions.sessions[0].getTier()
        // var loc = this.props.sessions.sessions[0].variants[0].getLocation();
        // var hlr = this.props.sessions.sessions[0].variants[0].getHighlightRegion();
        // browser.highlightRegion(loc.chr, loc.min, loc.max);
        // browser.setCenterLocation(hlr.chr, hlr.min, hlr.max);



    });
    // this.props.sessions.init();
    

  },

  shouldComponentUpdate(nextProps, nextState) {
    // console.log(this.state.value);
    // console.log(nextState.value);
    // return this.state.value !== nextState.value;
    console.log('in shouldComponentUpdate!!!!!!!!!');
    return true;
  },

  render() {
    return (
      <div>
        <QCToolbar sessions={this.props.sessions} settings={this.props.settings} view='condensed' />
        <DallianceHolder />
      </div>
    );
  }

});


var DallianceHolder = React.createClass({

  render() {
    var style = {
      backgroundColor: 'white',
      border: '6px solid grey'
    }
    return (
        <div id="svgHolder" style={style}></div>
    );
  }

});

var QCToolbar = React.createClass({
  
  shouldComponentUpdate(nextProps, nextState) {
    // console.log(this.state.value);
    // console.log(nextState.value);
    // return this.state.value !== nextState.value;
    console.log('sweet diggity dogggggggggg!!!!!!!!!');
    return true;
  },

  getInitialState() {
    console.log('in getInitialState in QCToolbar');
    return {
      currentVariant: this.props.sessions.getCurrentVariant(),
      view: this.props.view
    };
  },

  // nextVariant() {
  //   console.log('jhere!!');
  //   var i = this.sessions.next(browser);
  //   this.setState({sessionIndex: i.si, variantIndex: i.vi});
  // },
  nextVariant() {
    var nv = this.props.sessions.next(browser);
    this.setState({currentVariant: nv.variant});
    if (nv.done) {
      var content = zip.generate({type:"blob"});
      saveAs(content, "results.zip");
    }
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
    this.props.sessions.gotoCurrentVariant(browser);
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

  handleVariantSelect(si, vi) {
    var nv = this.props.sessions.goto(browser, si, vi, this.state.style);
    this.setState({currentVariant: nv});
    console.log(nv);
    console.log(this.state);
  },

  handleSnapshot() {
    var imgdata = browser.exportImage();
    imgdata = imgdata.split(',');
    if (imgdata.length === 2) {
        var screenshot = imgdata[1];
        var imgName = this.props.sessions.stringCurrentSession();
        // imageFolder.file(imgName + '.png', screenshot, {base64: true});
        //console.log(imgName)
        imageFolder.file(imgName + '.png', screenshot, {base64: true});
        console.log(imageFolder);
    } else {
        console.log('more than two parts to the image');
    }
  },

  handleView(view) {
    console.log(view);
    var style = this.props.settings.styles[view];

    console.log(style);
    this.setState({view: view});
    // this.props.sessions.updateStyle(browser, style);
  },

  render() {
    console.log('I am so totally rendering the in the QCToolbar');
    if (browser && this.props.sessions.style !== this.props.settings.styles[this.state.view]) {
      this.props.sessions.updateStyle(browser, this.props.settings.styles[this.state.view]);
    }

    console.log(this.state.currentVariant);

    var scoreBadge
    switch (this.state.currentVariant.score) {
      case 'variant':
        scoreBadge = (<span className="badge green qc-badge">&#x2713;</span>);
        break;
      case 'uncertain':
        scoreBadge = (<span className="badge amber qc-badge">?</span>);
        break;
      case 'not variant':
        scoreBadge = (<span className="badge red qc-badge">x</span>);
        break;
    }
    return (
      <Navbar toggleNavKey={0} className='QCToolbar'>
        <Nav eventKey={0}>
          <ModalTrigger modal={
            <SessionsModal sessions={this.props.sessions} handleVariantSelect={this.handleVariantSelect}/>
          }>
            <NavItem eventKey={1} href='#'>
              <Button>
                {this.state.currentVariant.locationString()} &nbsp; {scoreBadge}
              </Button>
            </NavItem>
          </ModalTrigger>
          <NavItem eventKey={2} href='#' onClick={this.handleHome}><Button><Glyphicon glyph='home' /></Button></NavItem>
          <NavItem eventKey={3} href='#' onClick={this.handlePrevious}><Button><Glyphicon glyph="chevron-left"/>Previous</Button></NavItem>
          <NavItem eventKey={4} href='#' onClick={this.handleQC.bind(this, 'not variant')}><Button>Not a Variant<Glyphicon glyph="chevron-right"/></Button></NavItem>
          <NavItem eventKey={5} href='#' onClick={this.handleQC.bind(this, 'uncertain')}><Button>Uncertain<Glyphicon glyph="chevron-right"/></Button></NavItem>
          <NavItem eventKey={6} href='#' onClick={this.handleQC.bind(this, 'variant')}><Button>Variant<Glyphicon glyph="chevron-right"/></Button></NavItem>
          <NavItem eventKey={7} href='#' onClick={this.handleSnapshot}><Button><Glyphicon glyph="camera"/></Button></NavItem>
          <NavItem eventKey={8} href='#' onClick={this.handleExport}><Button><Glyphicon glyph="save-file"/></Button></NavItem>
          <DropdownButton eventKey={9} title={<Button><Glyphicon glyph="eye-open"/></Button>}>
            <MenuItem eventKey={1} onSelect={this.handleView.bind(this, 'raw')}>Raw</MenuItem>
            <MenuItem eventKey={2} onSelect={this.handleView.bind(this, 'condensed')}>Condensed</MenuItem>
            <MenuItem eventKey={3} onSelect={this.handleView.bind(this, 'mismatch')}>Mismatch</MenuItem>
            <MenuItem eventKey={4} onSelect={this.handleView.bind(this, 'coverage')}>Coverage</MenuItem>
          </DropdownButton>
        </Nav>
      </Navbar>
    );    
  }
                    // <button type="button" class="btn btn-default qc-decision" id="buttonQCNotVariant" data-value="not variant">Not a Variant <span class="glyphicon glyphicon-chevron-right"></span></button>
                    // <button type="button" class="btn btn-default qc-decision" id="buttonQCPotentialVariant" data-value="uncertain">Uncertain <span class="glyphicon glyphicon-chevron-right"></span></button>
                    // <button type="button" class="btn btn-default qc-decision" id="buttonQCCertainVariant"  data-value="variant">Variant <span class="glyphicon glyphicon-chevron-right"></span></button>
});

module.exports = QC;