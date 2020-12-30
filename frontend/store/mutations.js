import * as types from './mutation_types.js'
import { getDefaultState } from './state.js'

export const mutations = {
  [types.RESET_STORE](state) {
    Object.assign(state, getDefaultState())
  },

  [types.CURRENTUSER_SET](state, user) {
    state.currentUser = user
  },

  [types.ERROR_OCCURED](state, error) {
    state.error = error
  },

  [types.CLEAR_ERROR](state) {
    state.error = {}
  },

  [types.ALERT](state, alert) {
    state.alert = alert
  },

  [types.STARTDATE_CHANGED](state, { startDate }) {
    state.startDate = new Date(startDate)
  },

  [types.WEEKPLAN_LOADED](state, { weekplan }) {
    state.weekplan = weekplan
  },

  [types.DISHES_LOADED](state, { dishes }) {
    state.dishes = dishes
  },

  [types.INGREDIENTS_LOADED](state, { ingredients, standards }) {
    state.allIngredients = ingredients
    state.standardItems = standards
  },

  [types.INGREDIENT_CHANGED](state, { ingredient }) {
    state.allIngredients = state.allIngredients.map(i => i.id === ingredient.id ? ingredient : i)
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
