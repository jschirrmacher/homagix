import React, { Component } from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import ProposalsList from './ProposalsList'
import IngredientsList from './IngredientsList'
import './App.css'
import DatePicker from 'react-date-picker'
import {fixAcceptedDishes} from '../actions/proposalsActions'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {startDate: new Date()}
  }

  fixDishes() {
    const accepted = Object.keys(this.props.accepted).map(a => parseInt(a))
    const date = this.state.startDate.toISOString().split('T')[0]
    this.props.fixAcceptedDishes(accepted, date)
  }

  render() {
    const error = this.props.error && <div className="error">{this.props.error}</div>
    return (
      <div className="App">
        <div>
          <h2>Vorschläge für die Woche</h2>
          <label>beginnend vom <DatePicker value={this.state.startDate}
                                           onChange={startDate => this.setState({startDate})}
                                           required={true}
                                           clearIcon={null}
                                           id="startDate"
                               />
          </label>
          <ProposalsList />
          <button id="accept-proposals" onClick={() => this.fixDishes()}>Festlegen</button>
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
    accepted: state.proposals.accepted,
    ingredients: state.proposals.ingredients
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({fixAcceptedDishes}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
