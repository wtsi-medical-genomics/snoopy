"use strict";

// import React from 'react';
// import {
//   Button,
//   Glyphicon,
//   TabbedArea,
//   TabPane,
//   Modal,
//   Input,
//   Alert,
//   ListGroup,
//   ListGroupItem
// } from 'react-bootstrap';

var React = require('react');
var rb = require('react-bootstrap');
var Col = rb.Col;
var Row = rb.Row;
var Grid = rb.Grid;
var Button = rb.Button;
var Glyphicon = rb.Glyphicon;
var TabbedArea = rb.TabbedArea;
var TabPane = rb.TabPane;
var Modal = rb.Modal;
var Input = rb.Input;
var Alert = rb.Alert;
var ListGroup = rb.ListGroup;
var ListGroupItem = rb.ListGroupItem;


var SessionListGroup = React.createClass({

  handleClick(si, vi, e) {
    e.preventDefault();
    this.props.handleClick(si, vi);
  },

  render() {
    var bamItem = this.props.session.bamFiles.map((bamFile) => {
      return bamFile.name
    });

    bamItem = (
      <ListGroupItem bsStyle='info'>
        {bamItem.join(', ')}
      </ListGroupItem>
    );

    var variantItems = this.props.session.variants.map((variant, variantIndex) => {
      var scoreBadge;
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
      if ((variantIndex === this.props.currentVariantIndex) && 
         (this.props.sessionIndex === this.props.currentSessionIndex)) {
        return (
          <ListGroupItem
            bsStyle="danger"
            key={variantIndex}
            href="#"
            onClick={this.handleClick.bind(this, this.props.sessionIndex, variantIndex)} >
            <b>{variant.locationString()}</b>
            {scoreBadge}
          </ListGroupItem>
        );
      } else {
        return (
          <ListGroupItem
            key={variantIndex}
            href="#"
            onClick={this.handleClick.bind(this, this.props.sessionIndex, variantIndex)} >
            {variant.locationString()}
            {scoreBadge}
          </ListGroupItem>
        );
      }
    });

    return (
      <ListGroup>
        {bamItem}
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
      <Modal show={this.props.show} onHide={this.close}  bsSize="small">
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

export default SessionsModal;