import React, {Component} from 'react'
import {connect} from 'react-redux'
import {setItemGroup} from '../actions/proposalsActions'
import {bindActionCreators} from 'redux'
import './IngredientsList.css'

let index = 0

const itemGroups = {
  fruit: {order: 1, title: 'Obst & Gemüse'},
  breakfast: {order: 2, title: 'Frühstück'},
  meat: {order: 3, title: 'Fleisch'},
  cooled: {order: 4, title: 'Frische & Kühlung'},
  tinned: {order: 5, title: 'Nahrungsmittel'},
  drinks: {order: 6, title: 'Getränke'},
  frozen: {order: 7, title: 'Tiefgekühlt'},
  other: {order: 8, title: 'Sonstiges'}
}

function classNames(props) {
  return Object.keys(props).filter(name => !!props[name]).join(' ')
}

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
    const ingredients = (this.props.ingredients || []).concat(this.state.additions)
    ingredients.sort((a, b) => itemGroups[a.group || 'other'].order - itemGroups[b.group || 'other'].order)
    return ingredients
  }

  render() {
    const items = this.getIngredients()
      .map(item => {
        const group = <select onChange={event => this.props.setItemGroup(item, event.target.value)}
                              defaultValue={item.group} className={'ItemGroup color-' + item.group}>
          <option value={null}>-- bitte auswählen --</option>
          {Object.keys(itemGroups).map(group => (
            <option key={group} value={group}>{itemGroups[group].title}</option>
          ))}
        </select>

        return <li key={item.id} className={classNames({inhibited: this.state.inhibit[item.id]})}>
          <button className="delete" onClick={event => this.removeIngredient(item, event.target.parentNode)}>
            &times;
          </button>
          {item.amount} {item.unit} {item.name} {group}
        </li>
      })

    return this.props.ingredients && this.props.ingredients.length
      ? <ul className="IngredientsList">
        {items}
        <li><input type="text" id="additionalItem"
                   onKeyDown={event => event.keyCode === 13 && this.addIngredient(event.target)}
                   onBlur={event => this.addIngredient(event.target)}
        /></li>
      </ul>
      : <div className="info">Akzeptiere einen Vorschlag, um die Zutatenliste zu füllen!</div>
  }
}

function mapStateToProps() {
  return {}
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({setItemGroup}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(IngredientsList)

