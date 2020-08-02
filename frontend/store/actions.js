import * as types from './mutation_types'
import { loadData, doFetch } from '@/lib/api'

export const actions = {
  [types.GET_PROPOSALS]: loadData('/proposals', types.PROPOSALS_LOADED),

  [types.GET_INGREDIENTS]: loadData('/ingredients', types.INGREDIENTS_LOADED),

  [types.DISH_ACCEPTED]: (context, { dishId }) => {
    context.commit(types.DISH_ACCEPTED, { dishId })
    loadData('/proposals', types.PROPOSALS_LOADED)(context)
  },

  [types.DISH_DECLINED]: (context, { dishId }) => {
    context.commit(types.DISH_DECLINED, { dishId })
    loadData('/proposals', types.PROPOSALS_LOADED)(context)
  },

  [types.SHOPPING_DONE]: async (context) => {
    const data = {
      accepted: context.state.accepted.join(','),
      date: context.state.startDate.toISOString()
    }
    await doFetch('post', '/proposals/fix', data)
    context.commit(types.SHOPPING_DONE)
  }
}
