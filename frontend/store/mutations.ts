import {
  CompleteItem,
  Dish,
  Ingredient,
  Proposal,
  Unit,
  User,
} from '../app-types'
import * as types from './mutation_types'
import { getDefaultState, State } from './state'

export const mutations = {
  [types.RESET_STORE](state: State): void {
    Object.assign(state, getDefaultState())
  },

  [types.CURRENTUSER_SET](state: State, payload: { currentUser: User }): void {
    state.currentUser = payload.currentUser
  },

  [types.ERROR_OCCURED](
    state: State,
    error: { message: string; details?: unknown }
  ): void {
    state.error = error
  },

  [types.CLEAR_ERROR](state: State): void {
    state.error = undefined
  },

  [types.ALERT](state: State, alert: { title: string; message: string }): void {
    state.alert = alert
  },

  [types.STARTDATE_CHANGED](
    state: State,
    { startDate }: { startDate: string }
  ): void {
    state.startDate = new Date(startDate)
  },

  [types.WEEKPLAN_LOADED](
    state: State,
    { weekplan }: { weekplan: Proposal[] }
  ): void {
    state.weekplan = weekplan
  },

  [types.DISHES_LOADED](state: State, { dishes }: { dishes: Dish[] }): void {
    state.dishes = dishes
  },

  [types.INGREDIENTS_LOADED](
    state: State,
    { allIngredients }: { allIngredients: Ingredient[] }
  ): void {
    state.allIngredients = allIngredients
  },

  [types.STANDARD_ITEMS_LOADED](
    state: State,
    { standardItems }: { standardItems: CompleteItem[] }
  ): void {
    state.standardItems = standardItems
  },

  [types.INGREDIENT_CHANGED](
    state: State,
    { ingredient }: { ingredient: Ingredient }
  ): void {
    state.allIngredients = state.allIngredients.map(i =>
      i.id === ingredient.id ? ingredient : i
    )
  },

  [types.UNITS_LOADED](state: State, { units }: { units: Unit[] }): void {
    state.units = units
  },

  [types.ACCEPTANCE_CHANGED](
    state: State,
    { accepted }: { accepted: string[] }
  ): void {
    state.accepted = accepted
  },

  [types.DECLINED_CHANGED](
    state: State,
    { declined }: { declined: string[] }
  ): void {
    state.declined = declined
  },

  [types.SHOPPING_DONE](state: State): void {
    state.accepted = []
    state.declined = []
    state.changes = []
  },

  [types.CHANGES_CHANGED](
    state: State,
    { changes }: { changes: CompleteItem[] }
  ): void {
    state.changes = changes
  },

  [types.SET_ACTIVE_ITEM](state: State, { itemId }: { itemId: string }): void {
    state.activeItemId = itemId
  },
}
