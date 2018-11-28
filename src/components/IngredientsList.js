import React, {Component} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'

let index = 0

class IngredientsList extends Component {
  constructor(props) {
    super(props)
    this.state = {inhibit: {}, additions: []}
  }

  removeIngredient(item) {
    this.setState(state => {
      if (state.inhibit[item.id]) {
        delete state.inhibit[item.id]
      } else if (item.id < 0) {
        state.additions = state.additions.filter(el => el.id !== item.id)
      } else {
        state.inhibit[item.id] = true
      }
      return state
    })
  }

  addIngredient(name) {
    this.setState(state => {
      state.additions.push({id: --index, name})
      return state
    })
  }

  getIngredients() {
    return (this.props.ingredients || []).concat(this.state.additions)
  }

  render() {
    const items = this.getIngredients()
      .map(item => (
        <li key={item.id} className={this.state.inhibit[item.id] ? 'inhibited' : undefined}>
          <button className="delete" onClick={() => this.removeIngredient(item)}>&times;</button>
          {item.amount} {item.unit} {item.name}
        </li>
      ))

    return <ul>
      {items}
      <li><input type="text" id="additionalItem" onKeyDown={event => {
        if (event.keyCode === 13) {
          this.addIngredient(event.target.value)
          event.target.value = ''
        }
      }}/></li>
    </ul>
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
