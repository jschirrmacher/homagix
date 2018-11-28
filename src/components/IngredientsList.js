import React, {Component} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'

let index = 0

class IngredientsList extends Component {
  constructor(props) {
    super(props)
    this.state = {inhibit: {}, additions: []}
  }

  removeIngredient(item, elem) {
    elem.classList.add('fading')
    setTimeout(() => this.setState(state => {
      if (state.inhibit[item.id]) {
        delete state.inhibit[item.id]
      } else if (item.id < 0) {
        state.additions = state.additions.filter(el => el.id !== item.id)
      } else {
        state.inhibit[item.id] = true
      }
      return state
    }), item.id < 0 ? 1000 : 1)
  }

  addIngredient(elem) {
    this.setState(state => {
      const name = elem.value
      if (name) {
        elem.value = ''
        state.additions.push({id: --index, name})
      }
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
          <button className="delete" onClick={event => this.removeIngredient(item, event.target.parentNode)}>
            &times;
          </button>
          {item.amount} {item.unit} {item.name}
        </li>
      ))

    return <ul>
      {items}
      <li><input type="text" id="additionalItem"
                 onKeyDown={event => event.keyCode === 13 && this.addIngredient(event.target)}
                 onBlur={event => this.addIngredient(event.target)}
      /></li>
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
