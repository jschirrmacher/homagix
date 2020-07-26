import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

class Ingredient extends Component {
  render() {
    const ingredient = this.props.allIngredients.find(ingredient => ingredient.id === this.props.value.id)

    return <div className="ingredient">
      {this.props.value.amount} {this.props.value.unit} {ingredient.name}
    </div>
  }
}

function mapStateToProps(state) {
  return {
    allIngredients: state.proposals.allIngredients
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Ingredient)