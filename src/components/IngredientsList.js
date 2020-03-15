import React, {Component} from 'react'
import {connect} from 'react-redux'
import {setItemGroup} from '../actions/proposalsActions'
import {bindActionCreators} from 'redux'
import './IngredientsList.css'

let index = 0

const itemGroups = {
  fruit: {order: 1, title: 'Obst & Gemüse'},
  breakfast: {order: 2, title: 'Brot & Frühstück'},
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
    ingredients.sort((a, b) => {
      const comp = itemGroups[a.group || 'other'].order - itemGroups[b.group || 'other'].order
      return comp || a.name.localeCompare(b.name)
    })
    return ingredients
  }

  setItemGroup(item, group) {
    if (item.id > 0) {
      this.props.setItemGroup(item, group)
    } else {
      this.setState({additions: this.state.additions.map(i => i.id === item.id ? Object.assign(i, {group}) : i)})
    }
  }

  render() {
    const items = this.getIngredients()
      .map(item => {
        const group = <select onChange={event => this.setItemGroup(item, event.target.value)}
                              defaultValue={item.group} className={'ItemGroup color-' + item.group}>
          <option value={null}>-- bitte auswählen --</option>
          {Object.keys(itemGroups).map(group => (
            <option key={group} value={group}>{itemGroups[group].title}</option>
          ))}
        </select>

        return <li key={item.id} className={classNames({inhibited: this.state.inhibit[item.id]})}>
          <button className="delete inline" onClick={event => this.removeIngredient(item, event.target.parentNode)}>
            &times;
          </button>
          {group}
          {item.amount} {item.unit} {item.name}
        </li>
      })

    return <ul className="IngredientsList">
        {items}
        <li><input type="text" id="additionalItem"
                   onKeyDown={event => event.keyCode === 13 && this.addIngredient(event.target)}
                   onBlur={event => this.addIngredient(event.target)}
        /></li>
      </ul>
  }
}

function mapStateToProps() {
  return {}
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({setItemGroup}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(IngredientsList)

