import { loadData, doFetch } from '../lib/api'
import {
  GET_PROPOSALS,
  PROPOSALS_LOADED,
  GET_INGREDIENTS,
  INGREDIENTS_LOADED,
  DISH_DECLINED,
  REMOVE_ITEM,
  CHANGES_CHANGED,
  SHOPPING_DONE,
  ADD_ITEM,
  TOGGLE_ACCEPTANCE,
  ACCEPTANCE_CHANGED,
  RESTORE_ITEM,
} from './mutation_types'

function eqItem(item) {
  if (item.id) {
    return i => i.id === item.id
  } else {
    const name = item.name.toLowerCase()
    return i => i.name.toLowerCase().localeCompare(name)
  }
}

function neItem(item) {
  return () => !eqItem(item)
}

export const actions = {
  [GET_PROPOSALS]: loadData('/proposals', PROPOSALS_LOADED),

  [GET_INGREDIENTS]: loadData('/ingredients', INGREDIENTS_LOADED),

  [TOGGLE_ACCEPTANCE]({ state, commit }, { dishId }) {
    const accepted = state.accepted.includes(dishId)
      ? state.accepted.filter(id => id !== dishId)
      : [...state.accepted, dishId]
    commit(ACCEPTANCE_CHANGED, { accepted })
  },

  [DISH_DECLINED](context, { dishId }) {
    context.commit(DISH_DECLINED, { dishId })
    loadData('/proposals', PROPOSALS_LOADED)(context)
  },

  [REMOVE_ITEM](context, { item }) {
    const changes = context.state.changes.filter(neItem(item))
    const existing = context.getters.shoppinglist.find(eqItem(item))
    if (existing) {
      existing.amount = -existing.amount
      changes.push(existing)
    }
    context.commit(CHANGES_CHANGED, { changes })
  },

  [RESTORE_ITEM](context, { item }) {
    const changes = context.state.changes.filter(neItem(item))
    context.commit(CHANGES_CHANGED, { changes })
  },

  [ADD_ITEM]: (context, { item }) => {
    item.amount = +item.amount
    const changes = [ ...context.state.changes ]
    const existing = changes.find(eqItem(item))
    if (existing) {
      existing.amount = +existing.amount + item.amount
    } else {
      changes.push(item)
    }
    context.commit(CHANGES_CHANGED, { changes })
  },

  [SHOPPING_DONE]: async (context) => {
    const data = {
      accepted: context.state.accepted,
      date: context.state.startDate.toISOString()
    }
    await doFetch('post', '/proposals/fix', data)
    context.commit(SHOPPING_DONE)
  }
}
