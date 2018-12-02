import * as types from '../actions/actionTypes'

const initialState = {proposals: {dishes: [], ingredients: []}}

export default function proposalsReducer(state = initialState, action) {
  switch(action.type) {
    case types.PROPOSALS_LOADED:
      return {...state, dishes: action.proposals.dishes, ingredients: action.proposals.ingredients}

    case types.PROPOSALS_INHIBITED:
      return {...state, inhibited: action.inhibited}

    case types.PROPOSAL_SETACCEPTANCE:
      return {...state, accepted: action.accepted}

    default:
      return state
  }
}
