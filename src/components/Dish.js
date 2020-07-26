import React, { Component } from 'react'
import './Dish.css'
import Ingredient from './Ingredient'

export default class Dish extends Component {
  constructor(props) {
    super(props)
    this.state = {showDetails: false}
  }

  toggleDetails() {
    this.setState(state => ({showDetails: !state.showDetails}))
  }

  render() {
    const ingredients = this.state.showDetails && (
      <ul className="ingredient-list">
        {this.props.value.ingredients.map(ingredient => (<li><Ingredient value={ingredient} key={ingredient.id} /></li>))}
      </ul>)

    return <div className="dish">
      <span onClick={() => this.toggleDetails()}>{this.props.value.name}</span>
      <span className="last-served">{(new Date(this.props.value.last)).toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', year: 'numeric'})}</span>
      {ingredients}
    </div>
  }
}
