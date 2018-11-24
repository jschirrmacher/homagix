import React, {Component} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'

class IngredientsList extends Component {
  constructor(props) {
    super(props)
    this.state = {inhibit: {}}
  }

  removeIngredient(item) {
    this.setState(state => {
      if (state.inhibit[item.id]) {
        delete state.inhibit[item.id]
      } else {
        state.inhibit[item.id] = true
      }
      return state
    })
  }

  render() {
    const items = this.props.ingredients && this.props.ingredients
      .map(item => (
        <li key={item.id} className={this.state.inhibit[item.id] ? 'inhibited' : undefined}>
          <button className="delete" onClick={() => this.removeIngredient(item)}>&times;</button>
          {item.amount} {item.unit} {item.name}
        </li>
      ))

    return <ul>{items}</ul>
  }
}

function mapStateToProps(state) {
  return {
    ingredients: state.proposals.ingredients
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(IngredientsList)
