import * as types from './mutation_types'
import { loadData } from '@/lib/api'

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
  [types.SHOPPING_DONE]: (context) => {
    context.commit(types.SHOPPING_DONE)
    loadData('/proposals/fix', )
  }
}
