import * as types from '../actions/actionTypes'

const initialState = {proposals: {dishes: [], ingredients: []}}

export default function proposalsReducer(state = initialState, action) {
  switch(action.type) {
    case types.PROPOSALS_LOADED:
      return {...state, dishes: action.proposals.dishes, ingredients: action.proposals.ingredients}

    default:
      return state
  }
}
