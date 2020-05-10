import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setItemGroup } from '../actions/proposalsActions'
import { bindActionCreators } from 'redux'
import './IngredientsList.css'

let index = 0

const itemGroups = {
  fruit: { order: 1, title: 'Obst & Gemüse' },
  breakfast: { order: 2, title: 'Brot & Frühstück' },
  meat: { order: 3, title: 'Fleisch' },
  cooled: { order: 4, title: 'Frische & Kühlung' },
  tinned: { order: 5, title: 'Nahrungsmittel' },
  drinks: { order: 6, title: 'Getränke' },
  frozen: { order: 7, title: 'Tiefgekühlt' },
  other: { order: 8, title: 'Sonstiges' }
}

const knownUnits = ['Stk', 'Pkg', 'Glas', 'Zehen', 'Würfel', 'Dose', 'Kopf', 'Bund', 'g', 'kg', 'L', 'ml', 'cm']

function guessUnit(text) {
  return knownUnits.find(unit => text.match(new RegExp('\\b' + unit + '\\.?\\b', 'i')))
}

function classNames(props) {
  return Object.keys(props).filter(name => !!props[name]).join(' ')
}

class IngredientsList extends Component {
  constructor(props) {
    super(props)
    this.state = { inhibit: {}, additions: [], modified: null, inputChanged: false }
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

  add(item, list) {
    const existing = list.find(entry => entry.name === item.name)
    if (existing && existing.unit === item.unit) {
      existing.amount += item.amount
    } else {
      item.id = --index
      list.push(item)
    }
  }

  addIngredient(elem) {
    if (elem.value && this.state.inputChanged) {
      this.setState(state => {
        const amount = parseFloat(elem.value.replace(/(\d),(\d)/, '$1.$2')) || 1
        const rest = elem.value.replace(new RegExp(('' + amount).replace(/\./, '[.,]')), '')
        const unit = guessUnit(rest) || 'Stk'
        const name = rest.replace(new RegExp(unit + '\\.?', 'i'), '').trim()
        this.add({ amount, unit, name }, state.additions)
        state.modified = name
        setTimeout(() => this.setState({ modified: null }), 500)
        elem.value = ''
        return state
      })
    }
  }

  handleKeyDown(event) {
    if (event.keyCode === 13) {
      this.addIngredient(event.target)
    }
    this.setState({ inputChanged: true })
  }

  selectIngredient(el, text) {
    if (['SELECT', 'BUTTON'].includes(el.tagName)) {
      return
    }
    const newItem = document.querySelector('#additionalItem input')
    newItem.value = text
    newItem.setSelectionRange(0, 0)
    newItem.focus()
    this.setState({ inputChanged: false })
  }

  getIngredients() {
    const ingredients = (this.props.ingredients || []).map(ingredient => ({ ...ingredient }))
    this.state.additions.forEach(add => this.add(add, ingredients))
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
      this.setState({ additions: this.state.additions.map(i => i.id === item.id ? Object.assign(i, { group }) : i) })
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

        const classes = classNames({ inhibited: this.state.inhibit[item.id], modified: this.state.modified === item.name })
        return <li key={item.id}
                   className={classes}
                   onClick={event => this.selectIngredient(event.target, item.unit + ' ' + item.name)}
               >
          <button className="delete inline" onClick={event => this.removeIngredient(item, event.target.parentNode)}>
            &times;
          </button>
          {group}
          {this.props.showAmount && <span className="amount">{item.amount}</span>}
          <span className="unit">{item.unit}</span>
          {item.name}
        </li>
      })

    return <ul className="IngredientsList">
      {items}
      {this.props.showNew && <li id="additionalItem">
        <input type="text"
          onKeyDown={event => this.handleKeyDown(event)}
          onBlur={event => this.addIngredient(event.target)}
        />
      </li>}
    </ul>
  }
}

function mapStateToProps() {
  return {}
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ setItemGroup }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(IngredientsList)

