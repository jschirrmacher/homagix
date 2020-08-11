import * as types from './mutation_types'

export const mutations = {
  [types.CLEAR_ERROR](state) {
    state.error = {}
  },

  [types.STARTDATE_CHANGED](state, { startDate }) {
    state.startDate = new Date(startDate)
  },

  [types.PROPOSALS_LOADED](state, { dishes }) {
    state.proposals = dishes
  },

  [types.INGREDIENTS_LOADED](state, { ingredients }) {
    state.allIngredients = ingredients
  },

  [types.ACCEPTANCE_CHANGED](state, { accepted }) {
    state.accepted = accepted
  },

  [types.DISH_DECLINED](state, { dishId }) {
    if (!state.declined.includes(dishId)) {
      state.declined.push(dishId)
    }
  },

  [types.SHOPPING_DONE](state) {
    state.accepted = []
    state.declined = []
    state.changes = []
  },

  [types.CHANGES_CHANGED](state, { changes }) {
    state.changes = changes
  }
}
