import { loadData, doFetch, fetchWeekplan, setFavorite } from '../lib/api'
import {
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
  GET_UNITS,
  UNITS_LOADED,
  UPDATE_AMOUNT,
  INGREDIENT_CHANGED,
  STARTDATE_CHANGED,
  DISHES_LOADED,
  CURRENTUSER_SET,
} from './mutation_types'
import {
  ADD_FAVORITE,
  MODIFY_DISH,
  CHANGE_GROUP,
  CHANGE_STARTDATE,
  INIT_APP,
  LOAD_DISHES,
  REMOVE_FAVORITE,
} from './action_types'
import jwt_decode from 'jwt-decode'
import { Context } from 'vm'

function eqItem(item) {
  const name = item.name.toLowerCase()
  return function (other) {
    if (item.id && other.id) {
      return item.id === other.id
    } else {
      return !other.name.toLowerCase().localeCompare(name)
    }
  }
}

function neItem(item) {
  const name = item.name.toLowerCase()
  return function (other) {
    if (item.id && other.id) {
      return item.id !== other.id
    } else {
      return other.name.toLowerCase().localeCompare(name)
    }
  }
}

async function updateWeekplan(context: Context): Promise<void> {
  const args = await fetchWeekplan(
    context.state.startDate,
    context.state.declined
  )
  context.commit(...args)
}

export const actions = {
  [INIT_APP](context: Context): void {
    const match = document.cookie.match(/\btoken=([^;]*)/)
    if (match) {
      const token = jwt_decode(match[1]) as { exp: number; sub: string; firstName: string }
      if (token.exp && token.exp < +new Date()) {
        const user = {
          id: token.sub,
          firstName: token.firstName,
        }
        context.commit(CURRENTUSER_SET, user)
      }
    }
  },

  async [CHANGE_STARTDATE](context: Context, { startDate }): Promise<void> {
    context.commit(STARTDATE_CHANGED, { startDate })
    await updateWeekplan(context)
  },

  [LOAD_DISHES]: loadData('/dishes', DISHES_LOADED),

  [GET_INGREDIENTS]: loadData('/ingredients', INGREDIENTS_LOADED),

  async [GET_UNITS](context: Context): Promise<void> {
    const units = await doFetch('GET', '/ingredients/units')
    context.commit(UNITS_LOADED, { units })
  },

  [TOGGLE_ACCEPTANCE](context: Context, { dishId }: { dishId: string }): void {
    const accepted = context.state.accepted.includes(dishId)
      ? context.state.accepted.filter(id => id !== dishId)
      : [...context.state.accepted, dishId]
    context.commit(ACCEPTANCE_CHANGED, { accepted })
  },

  async [DISH_DECLINED](context: Context, { dishId }: { dishId: string }): Promise<void> {
    context.commit(DISH_DECLINED, { dishId })
    await updateWeekplan(context)
  },

  [REMOVE_ITEM](context: Context, { item }): void {
    const changes = context.state.changes.filter(neItem(item))
    const proposed = context.getters.proposedItems.find(eqItem(item))
    const standard = context.state.standardItems.find(eqItem(item))
    const amount =
      (proposed ? proposed.amount : 0) + (standard ? standard.amount : 0)
    if (amount) {
      changes.push({ ...item, amount: -amount })
    }
    context.commit(CHANGES_CHANGED, { changes })
  },

  [RESTORE_ITEM](context: Context, { item }): void {
    const changes = context.state.changes.filter(neItem(item))
    context.commit(CHANGES_CHANGED, { changes })
  },

  async [ADD_ITEM](context: Context, { item }): Promise<void> {
    async function createNewItem(newItem) {
      const item = await doFetch('post', '/ingredients', newItem)
      context.commit(INGREDIENTS_LOADED, {
        ingredients: [...context.state.allIngredients, item],
        standards: context.state.standardItems,
      })
      return item
    }

    async function getChangedChanges(item) {
      const existing = context.state.changes.find(eqItem(item))
      if (existing) {
        const cmpFunc = eqItem(item)
        const replaceItem = {
          ...existing,
          amount: +existing.amount + item.amount,
        }
        return context.state.changes.map(i => (cmpFunc(i) ? replaceItem : i))
      } else {
        if (!item.id) {
          return [...context.state.changes, await createNewItem(item)]
        }
        return [...context.state.changes, item]
      }
    }

    item.amount = +item.amount
    context.commit(CHANGES_CHANGED, { changes: await getChangedChanges(item) })
  },

  async [UPDATE_AMOUNT](context: Context, { item, newAmount }): Promise<void> {
    function getChangedChanges(item, amount) {
      if (context.state.changes.find(eqItem(item))) {
        return context.state.changes.map(i =>
          i.id !== item.id ? i : { ...i, amount }
        )
      } else {
        return [...context.state.changes, { ...item, amount }]
      }
    }

    const proposedItem = [
      ...context.getters.proposedItems,
      ...context.state.standardItems,
    ].find(eqItem(item))
    const changes = getChangedChanges(
      item,
      proposedItem ? newAmount - proposedItem.amount : newAmount
    )
    context.commit(CHANGES_CHANGED, { changes })
  },

  async [SHOPPING_DONE](context: Context): Promise<void> {
    const data = { accepted: context.state.accepted }
    const weekStart = context.state.startDate.toISOString().split('T')[0]
    const nextPlannable = context.getters.nextDayToServe
    const date = weekStart > nextPlannable ? weekStart : nextPlannable
    await doFetch('post', '/weekplan/' + date + '/fix', data)
    context.commit(SHOPPING_DONE)
    await context.dispatch(LOAD_DISHES)
    await updateWeekplan(context)
  },

  async [CHANGE_GROUP](context: Context, { ingredient, group }): Promise<void> {
    await doFetch('put', '/ingredients/' + ingredient.id, { group })
    ingredient.group = group
    context.commit(INGREDIENT_CHANGED, { ingredient })
  },

  async [ADD_FAVORITE](context: Context, { dishId }: { dishId: string }): Promise<void> {
    const args = await setFavorite(dishId, true)
    context.commit(...args)
  },

  async [REMOVE_FAVORITE](context: Context, { dishId }: { dishId: string }) : Promise<void>{
    const args = await setFavorite(dishId, false)
    context.commit(...args)
  },

  async [MODIFY_DISH](context: Context, { dish }): Promise<void> {
    await doFetch('PATCH', '/dishes/' + dish.id, dish)
    context.commit(DISHES_LOADED, { dishes: context.state.dishes.map(d => d.id === dish.id ? dish : d)})
  }
}
