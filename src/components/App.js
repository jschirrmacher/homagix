import React, { Component } from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import ProposalsList from './ProposalsList'
import IngredientsList from './IngredientsList'
import './App.css'

class App extends Component {
  render() {
    const error = this.props.error && <div className="error">{this.props.error}</div>
    return (
      <div className="App">
        <div>
          <h2>Vorschläge für die Woche</h2>
          <ProposalsList />
        </div>
        <div>
          <h2>Benötigte Zutaten</h2>
          <IngredientsList ingredients={this.props.ingredients} />
        </div>
        {error}
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    error: state.error.message,
    ingredients: state.proposals.ingredients
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
