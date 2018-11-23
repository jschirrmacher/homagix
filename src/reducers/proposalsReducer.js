import * as types from '../actions/actionTypes'

export default function proposalsReducer(state = {proposals: []}, action) {
  switch(action.type) {
    case types.PROPOSALS_LOADED:
      return {...state, data: action.proposals}

    default:
      return state
  }
}
