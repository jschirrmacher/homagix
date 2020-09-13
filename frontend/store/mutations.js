import * as types from './mutation_types.js'

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

  [types.INGREDIENTS_LOADED](state, { ingredients, standards }) {
    state.allIngredients = ingredients
    state.standardItems = standards
  },

  [types.UNITS_LOADED](state, { units }) {
    state.units = units
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
  },

  [types.SET_ACTIVE_ITEM](state, { itemId }) {
    state.activeItemId = itemId
  }
}
