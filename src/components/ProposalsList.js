import React, { Component } from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {getProposals} from '../actions/proposalsActions'

class ProposalsList extends Component {
  constructor(props) {
    super(props)
    this.props.getProposals()
    this.state = {inhibit: []}
  }

  removeProposal(item) {
    this.setState(state => {
      if (!state.inhibit.some(id => id === item.id)) {
        state.inhibit.push(item.id)
      }
      this.props.getProposals(state.inhibit)
      return state
    })
  }

  render() {
    const items = this.props.proposals && this.props.proposals.map(item => (
      <li key={item.id}>
        <button className="delete" onClick={() => this.removeProposal(item)}>&times;</button>
        {item.name}
      </li>
    ))

    return <ul>{items}</ul>
  }
}

function mapStateToProps(state) {
  return {
    proposals: state.proposals.data
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({getProposals}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(ProposalsList)
