"use strict";

import JSZip from 'JSZip';

class Sessions {
  constructor() {
    this.sessions = [];
    this.index = 0;
  }

  next(b, callback) {
    let nextVariant = this.sessions[this.index].next(b, callback);
    if (nextVariant.done) {
      if (this.index < this.sessions.length - 1) {
        this.sessions[++this.index].init(b, this.style);
        nextVariant = {variant: this.gotoCurrentVariant(b, callback), done: false};
      } else {
        console.log('finished QC');
      }
    }
    return nextVariant;
  }

  previous(b) {
    let previousVariant = this.sessions[this.index].previous(b);
    if (!previousVariant) {
      if (this.index > 0) {
        this.index--;
        this.sessions[this.index].init(b, this.style);
        // Need to visit the last element of the previous session
        this.sessions[this.index].index = this.sessions[this.index].variants.length - 1;
        previousVariant = this.gotoCurrentVariant(b);
      } else {
        console.log('at the beginning');
      }
    }
    return previousVariant;
  }

  setQC(decision) {
    this.sessions[this.index].setQC(decision);
  }

  gotoCurrentVariant(b, callback) {
    return this.sessions[this.index].gotoCurrentVariant(b, callback);
  }

  getCurrentVariant() {
    return this.sessions[this.index].getCurrentVariant();
  }

  goto(b, si, vi) {
    if (this.index !== si) {
      this.index = si;
      return this.sessions[si].goto(b, this.style, vi);
    } else {
      this.sessions[this.index].index = vi;
      return this.gotoCurrentVariant(b);
    }
  }

  /** Add tiers and visit the very first session/variant */
  // Sessions.prototype.jump = function(b) {
  //     if (typeof(this.style) === 'undefined')
  //         throw "A style sheet has not been set.";
  //     this.sessions[this.index].init(b, style);
  // };

  /** Add tiers and visit the very first session/variant */
  init(b, style) {
    if (typeof(style) !== 'undefined')
      this.style = style;
    if (typeof(this.style) === 'undefined')
      throw "A style sheet has not been set.";
    this.sessions[this.index].init(b, this.style);
  };

  getCurrentVariantIndex() {
    return this.sessions[this.index].getCurrentVariantIndex();
  };

  getCurrentSessionIndex() {
    return this.index;
  }

  stringCurrentSession() {
    return this.sessions[this.index].stringCurrentSession();
  }


  generateHTMLreport() {
    let embedImage = true;
    let report = this.generateQCreport(embedImage);
    
  }

  generateQCreport(embedImage=false) {
    this.getHTMLResultsSelectionModal();
    let sessions = this.sessions.reduce((accum, session)  => {
      return accum.concat(session.generateQCreport(embedImage))
    }, []);
    let jso = {
      date: Date(),
      sessions: sessions
    };
    return JSON.stringify(jso, null, '  ');
  }

  updateStyle(b, style) {
    this.style = style;
    this.sessions[this.index].updateStyle(b, style);
  }

  getNumVariants() {
    let n = 0;
    this.sessions.forEach((session) => {
      n += session.variants.length;
    });
    return n;
  }

  getNumVariantsReviewed() {
    let n = 0;
    this.sessions.forEach((session) => {
      n += session.getNumVariantsReviewed();
    });
    return n;
  }

  getNumSessions() {
    return this.sessions.length;
  }

  getHTMLResultsSelectionModal() {
    let sessions = this.sessions.map((session, sessionIndex)  => {
      return session.getHTMLResultsSelectionModal()
    }).join('');
    console.log(sessions);
  }

  takeSnapshot(browser) {
    this.sessions[this.index].takeSnapshot(browser);
  }

  getSnasphots() {
    let zip = new JSZip();
    let imageFolder = zip.folder('images');
    this.sessions.map(s => {
      s.getSnasphots(imageFolder);
    })
    return zip.generate({type:'blob'});
  }

  getNumSnapshots() {
    let n = this.sessions.reduce((accum, s) => {
      return accum + s.getNumSnapshots();
    }, 0);
    return n;
  }

}

export default Sessions