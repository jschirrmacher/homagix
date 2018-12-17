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

    case types.PROPOSAL_FIXED:
      return {...state, accepted: [], inhibited: []}

    case types.INGREDIENTS_LOADED:
      return {...state, allIngredients: action.ingredients}

    case types.INGREDIENT_UPDATED:
      return {
        ...state,
        allIngredients: state.allIngredients.map(i => i.id === action.ingredient.id ? action.ingredient : i),
        ingredients: state.ingredients.map(i => i.id === action.ingredient.id ? action.ingredient : i)
      }

    default:
      return state
  }
}
