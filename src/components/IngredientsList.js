import React, {Component} from 'react'

let index = 0

class IngredientsList extends Component {
  constructor(props) {
    super(props)
    this.state = {inhibit: {}, additions: []}
  }

  removeIngredient(item, elem) {
    if (item.id < 0) {
      elem.classList.add('fading')
      setTimeout(() => this.setState(state => {
        state.additions = state.additions.filter(el => el.id !== item.id)
        return state
      }), 1000)
    } else {
      this.setState(state => {
        state.inhibit[item.id] = !state.inhibit[item.id]
        return state
      })
    }
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

    return this.props.ingredients && this.props.ingredients.length
      ? <ul>
          {items}
          <li><input type="text" id="additionalItem"
                     onKeyDown={event => event.keyCode === 13 && this.addIngredient(event.target)}
                     onBlur={event => this.addIngredient(event.target)}
          /></li>
      </ul>
      : <div className="info">Akzeptiere einen Vorschlag, um die Zutatenliste zu füllen!</div>
  }
}

export default IngredientsList
