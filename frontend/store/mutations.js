import * as types from './mutation_types'

export const mutations = {
  [types.CLEAR_ERROR](state) {
    state.error = {}
  },

  [types.PROPOSALS_LOADED](state, { dishes, ingredients }) {
    state.proposals = dishes
    state.selectedIngredients = ingredients
  },

  [types.INGREDIENTS_LOADED](state, ingredients) {
    state.allIngredients = ingredients
  },

  [types.DISH_ACCEPTED](state, { dishId }) {
    if (state.accepted.includes(dishId)) {
      state.accepted = state.accepted.filter(id => id !== dishId)
    } else {
      state.accepted.push(dishId)
    }
  },

  [types.DISH_DECLINED](state, { dishId }) {
    if (state.declined.includes(dishId)) {
      state.declined = state.declined.filter(id => id !== dishId)
    } else {
      state.declined.push(dishId)
    }
  },

  [types.SHOPPING_DONE](state) {
    state.accepted = []
    state.declined = []
    state.extras = []
  },
}
