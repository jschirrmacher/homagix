import * as types from './mutation_types'
import { getDefaultState } from './state'

export const mutations = {
  [types.RESET_STORE](state): void {
    Object.assign(state, getDefaultState())
  },

  [types.CURRENTUSER_SET](state, user): void {
    state.currentUser = user
  },

  [types.ERROR_OCCURED](state, error): void {
    state.error = error
  },

  [types.CLEAR_ERROR](state): void {
    state.error = {}
  },

  [types.ALERT](state, alert): void {
    state.alert = alert
  },

  [types.STARTDATE_CHANGED](state, { startDate }): void {
    state.startDate = new Date(startDate)
  },

  [types.WEEKPLAN_LOADED](state, { weekplan }): void {
    state.weekplan = weekplan
  },

  [types.DISHES_LOADED](state, { dishes }): void {
    state.dishes = dishes
  },

  [types.DISH_CHANGED](state, { dish }): void {
    state.dishes = state.dishes.map(d => (d.id === dish.id ? dish : d))
  },

  [types.INGREDIENTS_LOADED](state, { ingredients, standards }): void {
    state.allIngredients = ingredients
    state.standardItems = standards
  },

  [types.INGREDIENT_CHANGED](state, { ingredient }): void {
    state.allIngredients = state.allIngredients.map(i =>
      i.id === ingredient.id ? ingredient : i
    )
  },

  [types.UNITS_LOADED](state, { units }): void {
    state.units = units
  },

  [types.ACCEPTANCE_CHANGED](state, { accepted }): void {
    state.accepted = accepted
  },

  [types.DISH_DECLINED](state, { dishId }): void {
    if (!state.declined.includes(dishId)) {
      state.declined.push(dishId)
    }
  },

  [types.SHOPPING_DONE](state): void {
    state.accepted = []
    state.declined = []
    state.changes = []
  },

  [types.CHANGES_CHANGED](state, { changes }): void {
    state.changes = changes
  },

  [types.SET_ACTIVE_ITEM](state, { itemId }): void {
    state.activeItemId = itemId
  },
}
