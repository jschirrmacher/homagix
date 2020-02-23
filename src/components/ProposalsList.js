import React, { Component } from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {getProposals, discardProposal, toggleProposalAcceptance} from '../actions/proposalsActions'
import Dish from './Dish'

class ProposalsList extends Component {
  constructor(props) {
    super(props)
    this.props.getProposals()
  }

  render() {
    const items = this.props.proposals && this.props.proposals.map(item => (
      <li key={item.id} className={this.props.accepted[item.id] ? 'accepted' : ''}>
        <button className="delete" onClick={() => this.props.discardProposal(item)} title="Reject proposal">&times;</button>
        <Dish value={item} />
        <button className="accept" onClick={() => this.props.toggleProposalAcceptance(item)} title="Accept proposal">&#10003;</button>
      </li>
    ))

    return <ul className="ProposalsList">{items}</ul>
  }
}

function mapStateToProps(state) {
  return {
    proposals: state.proposals.dishes,
    accepted: state.proposals.accepted || {}
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({getProposals, discardProposal, toggleProposalAcceptance}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(ProposalsList)
