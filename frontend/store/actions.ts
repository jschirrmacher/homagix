import {
  doFetch,
  fetchWeekplan,
  setFavorite,
  fetchIngredientsAndStandardItems,
} from '../lib/api'
import {
  GET_INGREDIENTS,
  INGREDIENTS_LOADED,
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
  STARTDATE_CHANGED,
  DISHES_LOADED,
  CURRENTUSER_SET,
  ERROR_OCCURED,
  WEEKPLAN_LOADED,
  DECLINED_CHANGED,
  STANDARD_ITEMS_LOADED,
} from './mutation_types'
import {
  ADD_FAVORITE,
  MODIFY_DISH,
  CHANGE_GROUP,
  CHANGE_STARTDATE,
  INIT_APP,
  LOAD_DISHES,
  REMOVE_FAVORITE,
  DISH_DECLINED,
} from './action_types'
import jwt_decode from 'jwt-decode'
import { CompleteItem, Dish, Ingredient, Unit } from '../app-types'
import { State } from './state'
import { ActionTree, Dispatch } from 'vuex'
import { Getters } from './getters'

type Context = {
  commit: (type: string, state: Partial<State>) => void
  state: State
  dispatch: Dispatch
  getters: Getters
}

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
  try {
    const weekplan = await fetchWeekplan(
      context.state.startDate,
      context.state.declined
    )
    context.commit(WEEKPLAN_LOADED, { weekplan })
  } catch (error) {
    context.commit(ERROR_OCCURED, error)
  }
}

export const actions: ActionTree<State, State> = {
  [INIT_APP](context: Context): void {
    const match = document.cookie.match(/\btoken=([^;]*)/)
    if (match) {
      const token = jwt_decode(match[1]) as {
        exp: number
        sub: string
        firstName: string
      }
      if (token.exp && token.exp < +new Date()) {
        const currentUser = {
          id: token.sub,
          firstName: token.firstName,
        }
        context.commit(CURRENTUSER_SET, { currentUser })
      }
    }
  },

  async [CHANGE_STARTDATE](
    context: Context,
    { startDate }: { startDate: Date }
  ): Promise<void> {
    context.commit(STARTDATE_CHANGED, { startDate })
    await updateWeekplan(context)
  },

  async [LOAD_DISHES](context: Context): Promise<void> {
    await guardWithTryCatch(context, async () => {
      const { dishes } = ((await doFetch('GET', '/dishes')) as unknown) as {
        dishes: Dish[]
      }
      context.commit(DISHES_LOADED, { dishes })
    })
  },

  async [GET_INGREDIENTS](context: Context): Promise<void> {
    guardWithTryCatch(context, async () => {
      const {
        allIngredients,
        standardItems,
      } = await fetchIngredientsAndStandardItems()
      context.commit(INGREDIENTS_LOADED, { allIngredients })
      context.commit(STANDARD_ITEMS_LOADED, { standardItems })
    })
  },

  async [GET_UNITS](context: Context): Promise<void> {
    await guardWithTryCatch(context, async () => {
      const units = ((await doFetch(
        'GET',
        '/ingredients/units'
      )) as unknown) as Unit[]
      context.commit(UNITS_LOADED, { units })
    })
  },

  [TOGGLE_ACCEPTANCE](context: Context, { dishId }: { dishId: string }): void {
    const accepted = context.state.accepted.includes(dishId)
      ? context.state.accepted.filter(id => id !== dishId)
      : [...context.state.accepted, dishId]
    context.commit(ACCEPTANCE_CHANGED, { accepted })
  },

  async [DISH_DECLINED](
    context: Context,
    { dishId }: { dishId: string }
  ): Promise<void> {
    const declined = [...context.state.declined]
    if (!declined.includes(dishId)) {
      declined.push(dishId)
      context.commit(DECLINED_CHANGED, { declined })
      await updateWeekplan(context)
    }
  },

  [REMOVE_ITEM](context: Context, { item }: { item: CompleteItem }): void {
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

  [RESTORE_ITEM](context: Context, { item }: { item: CompleteItem }): void {
    const changes = context.state.changes.filter(neItem(item))
    context.commit(CHANGES_CHANGED, { changes })
  },

  async [ADD_ITEM](
    context: Context,
    { item }: { item: CompleteItem }
  ): Promise<void> {
    async function createNewItem(newItem) {
      const item = (await doFetch(
        'post',
        '/ingredients',
        newItem
      )) as Ingredient
      const allIngredients = [...context.state.allIngredients, item]
      context.commit(INGREDIENTS_LOADED, { allIngredients })
      return item
    }

    async function getChangedChanges(item) {
      const existing = context.state.changes.find(eqItem(item))
      if (existing) {
        const cmpFunc = eqItem(item)
        const replaceItem = {
          ...existing,
          amount: +existing.amount + +item.amount,
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

  async [UPDATE_AMOUNT](
    context: Context,
    { item, newAmount }: { item: Ingredient; newAmount: number }
  ): Promise<void> {
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
    context.commit(SHOPPING_DONE, {})
    await context.dispatch(LOAD_DISHES)
    await updateWeekplan(context)
  },

  async [CHANGE_GROUP](
    context: Context,
    { ingredient, group }: { ingredient: Ingredient; group: string }
  ): Promise<void> {
    guardWithTryCatch(context, async () => {
      await doFetch('put', '/ingredients/' + ingredient.id, { group })
      ingredient.group = group
      const allIngredients = context.state.allIngredients.map(i =>
        i.id === ingredient.id ? ingredient : i
      )
      context.commit(INGREDIENTS_LOADED, { allIngredients })
    })
  },

  async [ADD_FAVORITE](
    context: Context,
    { dishId }: { dishId: string }
  ): Promise<void> {
    guardWithTryCatch(context, async () => {
      const dish = await setFavorite(dishId, true)
      const dishes = context.state.dishes.map(d =>
        d.id === dish.id ? dish : d
      )
      context.commit(DISHES_LOADED, { dishes })
    })
  },

  async [REMOVE_FAVORITE](
    context: Context,
    { dishId }: { dishId: string }
  ): Promise<void> {
    guardWithTryCatch(context, async () => {
      const dish = await setFavorite(dishId, false)
      const dishes = context.state.dishes.map(d =>
        d.id === dish.id ? dish : d
      )
      context.commit(DISHES_LOADED, { dishes })
    })
  },

  async [MODIFY_DISH](
    context: Context,
    { dish }: { dish: Dish }
  ): Promise<void> {
    guardWithTryCatch(context, async () => {
      await doFetch('PATCH', '/dishes/' + dish.id, dish)
      context.commit(DISHES_LOADED, {
        dishes: context.state.dishes.map(d => (d.id === dish.id ? dish : d)),
      })
    })
  },
}

async function guardWithTryCatch(
  context: Context,
  func: () => Promise<unknown>
): Promise<void> {
  try {
    await func()
  } catch (error) {
    context.commit(ERROR_OCCURED, { error })
  }
}
