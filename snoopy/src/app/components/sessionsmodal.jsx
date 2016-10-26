"use strict";

import React from 'react';
import {
  Alert,
  Button,
  Glyphicon,
  Input,
  ListGroup,
  ListGroupItem,
  Modal,
  TabbedArea,
  TabPane,
} from 'react-bootstrap';

const SessionListGroup = React.createClass({

  handleClick(si, vi, e) {
    e.preventDefault();
    this.props.handleClick(si, vi);
  },

  render() {
    let seqItems = this.props.session.bamFiles.map((seqFile, index) => {
      return (<li key={index}>{seqFile.name}</li>)
    });

    let seqFilesListStyle = {
      paddingLeft: "0.5em",
      wordWrap: "break-word"
    };

    let headerStyle = {
      backgroundColor: "#F0F1F3"
    }
    
    let seqFilesList = (
      <ListGroupItem style={headerStyle}>
        <ul style={seqFilesListStyle}>
          {seqItems}
        </ul>
      </ListGroupItem>
    );

    let variantItems = this.props.session.variants.map((variant, variantIndex) => {
      let scoreBadge;
      switch (variant.score) {
        case 'variant':
          scoreBadge = (<span className="badge pull-right green qc-badge">&#x2713;</span>);
          break;
        case 'uncertain':
          scoreBadge = (<span className="badge pull-right amber qc-badge">?</span>);
          break;
        case 'not variant':
          scoreBadge = (<span className="badge pull-right red qc-badge">x</span>);
          break;
      }
      let hereGlyphiconStyle={paddingLeft: "1em"};
      let hereListGroupItemStyle={backgroundColor: "LightSteelBlue"};
      if ((variantIndex === this.props.currentVariantIndex) && 
         (this.props.sessionIndex === this.props.currentSessionIndex)) {
        return (
          <ListGroupItem
            key={variantIndex}
            href="#"
            onClick={this.handleClick.bind(this, this.props.sessionIndex, variantIndex)}
            style={hereListGroupItemStyle}
          >
            <b>
              {variant.locationString()}
              <Glyphicon bsSize="large" style={hereGlyphiconStyle} glyph="hand-left" />
            </b>
            {scoreBadge}
          </ListGroupItem>
        );
      } else {
        return (
          <ListGroupItem
            key={variantIndex}
            href="#"
            onClick={this.handleClick.bind(this, this.props.sessionIndex, variantIndex)}
          >
            {variant.locationString()}
            {scoreBadge}
          </ListGroupItem>
        );
      }
    });

    return (
      <ListGroup>
        {seqFilesList}
        {variantItems}
      </ListGroup>
    );
  }

});

var SessionsModal = React.createClass({

  // shouldComponentUpdate(nextProps, nextState) {
  //   return this.state.value !== nextState.value;
  // },

  handleClick(si, vi) {
    this.close();
    this.props.handleVariantSelect(si, vi);
  },

  close() {
    this.props.close();
  },

  render() {
    var currentVariantIndex = this.props.sessions.getCurrentVariantIndex();
    var currentSessionIndex = this.props.sessions.getCurrentSessionIndex();
    var SessionListGroups = this.props.sessions.sessions.map((session, index) => {
      return (
        <SessionListGroup
          session={session}
          key={index}
          sessionIndex={index}
          currentVariantIndex={currentVariantIndex}
          currentSessionIndex={currentSessionIndex}
          handleClick={this.handleClick} />
      );
    });

    var overflow = {
      maxHeight: 'calc(100vh - 144px)',
      overflowY: 'auto'
    };

    return (
      <Modal show={this.props.show} onHide={this.close}  bsSize="medium">
        <Modal.Header closeButton>
          <Modal.Title>Select a variant</Modal.Title>
        </Modal.Header>
        <Modal.Body style={overflow}>
          {SessionListGroups}
        </Modal.Body>
      </Modal>
    );
  }
});

export default SessionsModal