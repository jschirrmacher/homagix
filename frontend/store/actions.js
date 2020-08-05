import { loadData, doFetch } from '@/lib/api'
import {
  GET_PROPOSALS,
  PROPOSALS_LOADED,
  GET_INGREDIENTS,
  INGREDIENTS_LOADED,
  DISH_ACCEPTED,
  DISH_DECLINED,
  ITEM_REMOVED,
  CHANGES_CHANGED,
  SHOPPING_DONE,
  ITEM_ADDED,
} from './mutation_types'

export const actions = {
  [GET_PROPOSALS]: loadData('/proposals', PROPOSALS_LOADED),

  [GET_INGREDIENTS]: loadData('/ingredients', INGREDIENTS_LOADED),

  [DISH_ACCEPTED]: (context, { dishId }) => {
    context.commit(DISH_ACCEPTED, { dishId })
    loadData('/proposals', PROPOSALS_LOADED)(context)
  },

  [DISH_DECLINED]: (context, { dishId }) => {
    context.commit(DISH_DECLINED, { dishId })
    loadData('/proposals', PROPOSALS_LOADED)(context)
  },

  [ITEM_REMOVED]: (context, { ingredientId }) => {
    const changes = context.state.changes.filter(item => item.id !== ingredientId)
    const existing = context.getters.shoppinglist.find(item => item.id === ingredientId)
    if (existing) {
      existing.amount = -existing.amount
      changes.push(existing)
      context.commit(CHANGES_CHANGED, { changes })
    }
  },

  [ITEM_ADDED]: (context, { item }) => {
    const changes = [ ...context.state.changes ]
    const existing = context.getters.shoppinglist.find(sItem => sItem.id === item.id)
    item.amount = +item.amount
    if (existing) {
      existing.amount = +existing.amount + item.amount
      changes.push(existing)
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
