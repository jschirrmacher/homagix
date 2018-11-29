import React, { Component } from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {getProposals} from '../actions/proposalsActions'

const selected = obj => Object.keys(obj).filter(k => obj[k])

class ProposalsList extends Component {
  constructor(props) {
    super(props)
    this.props.getProposals()
    this.state = {
      inhibit: {},
      accepted: {}
    }
  }

  removeProposal(item) {
    const inhibit = this.state.inhibit
    inhibit[item.id] = item
    this.setState({inhibit})
    this.props.getProposals(selected(inhibit), selected(this.state.accepted))
  }

  acceptProposal(item) {
    const accepted = this.state.accepted
    accepted[item.id] = !accepted[item.id]
    this.setState({accepted})
    this.props.getProposals(selected(this.state.inhibit), selected(accepted))
  }

  render() {
    const items = this.props.proposals && this.props.proposals.map(item => (
      <li key={item.id} className={this.state.accepted[item.id] ? 'accepted' : ''}>
        <button className="delete" onClick={() => this.removeProposal(item)} title="Reject proposal">&times;</button>
        {item.name}
        <button className="accept" onClick={() => this.acceptProposal(item)} title="Accept proposal">&#10003;</button>
      </li>
    ))

    return <ul>{items}</ul>
  }
}

function mapStateToProps(state) {
  return {
    proposals: state.proposals.dishes
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({getProposals}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(ProposalsList)
