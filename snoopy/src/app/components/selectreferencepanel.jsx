"use strict"

import React from 'react'
import {
  Input,
  Panel,
} from 'react-bootstrap'

const SelectReferencePanel = React.createClass({

  componentDidMount() {
    this.getDOMNode().scrollIntoView()
  },

  handleChange(v, e) {
    this.props.handleReferenceChange(v)
  },

  render() {

    let formStyle = {
      backgroundColor: 'aliceblue',
      padding: '10px',
      width: '100%'
    }

    const referencesSummary = this.props.referencesSummary
    let node
    
    if (referencesSummary) {
      let selectNodes = []
      for (let k in referencesSummary) {
        let v = referencesSummary[k]['coordSystem']
        let label = (
          <div>
            {`${v.auth}${v.version} / ${v.ucscName}`}
            <span className="badge absolute-right">
              {v.speciesName}
            </span>
          </div>
        )
        let node = (
          <Input type="radio"
            ref={k}
            key={k}
            name="reference"
            label={label}
            onChange={this.handleChange.bind(this, k)}
          />
        )
        selectNodes.push(node)
      }
      node = (
        <form style={formStyle}>
          {selectNodes}
        </form>
      )
    } else {
      node = (
        <div>
          LOADING...
        </div>
      )
    }


    return (
      <Panel>
        <h4>Select Reference Genome</h4>
        {node}
      </Panel>
    )
  }

})

module.exports = SelectReferencePanel