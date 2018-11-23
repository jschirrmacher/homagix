import * as types from '../actions/actionTypes'

export default function errorReducer(state = {}, action) {
  switch(action.type) {
    case types.ERROR:
      return {...state, message: action.error}

    default:
      return state
  }
}
