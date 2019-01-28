import React, {Component, Fragment} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import ProposalsList from './ProposalsList'
import IngredientsList from './IngredientsList'
import './App.css'
import DatePicker from 'react-date-picker'
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs'
import "react-tabs/style/react-tabs.css"
import {fixAcceptedDishes, getIngredients} from '../actions/proposalsActions'

const hot = location.hostname === 'localhost' && require('react-hot-loader/root').hot

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {startDate: new Date()}
    this.props.getIngredients()
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
        <Tabs forceRenderTabPanel={true}>
          <TabList>
            <Tab>Planen</Tab>
            <Tab>Einkaufen</Tab>
            <Tab>Verwalten</Tab>
          </TabList>

          <TabPanel>
            <label>beginnend vom <DatePicker value={this.state.startDate}
                                             onChange={startDate => this.setState({startDate})}
                                             required={true}
                                             clearIcon={null}
                                             id="startDate"
            />
            </label>
            <ProposalsList/>
            <button className="print-button" onClick={() => window.print()}>Drucken</button>
          </TabPanel>

          <TabPanel>
            <IngredientsList ingredients={this.props.ingredients}/>
            {this.props.ingredients && this.props.ingredients.length
              ? <Fragment>
                  <button className="print-button" onClick={() => window.print()}>Drucken</button>
                  <button id="accept-proposals" onClick={() => this.fixDishes()}>Erledigt</button>
                </Fragment>
              : ''
            }
          </TabPanel>

          <TabPanel>
            <IngredientsList ingredients={this.props.allIngredients}/>
          </TabPanel>
        </Tabs>
        {error}
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    error: state.error.message,
    accepted: state.proposals.accepted,
    ingredients: state.proposals.ingredients,
    allIngredients: state.proposals.allIngredients
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({fixAcceptedDishes, getIngredients}, dispatch)
}

const app = hot ? hot(App, {cacheDirectory: true}) : App
export default connect(mapStateToProps, mapDispatchToProps)(app)
