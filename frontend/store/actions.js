import { loadData, doFetch } from '../lib/api.js'
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
  GET_UNITS,
  UNITS_LOADED,
  UPDATE_AMOUNT,
} from './mutation_types.js'

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

export const actions = {
  [GET_PROPOSALS]: loadData('/proposals', PROPOSALS_LOADED),

  [GET_INGREDIENTS]: loadData('/ingredients', INGREDIENTS_LOADED),

  async [GET_UNITS]({ commit }) {
    const units = await doFetch('GET', '/ingredients/units')
    commit(UNITS_LOADED, { units })
  },

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
    const existing = context.getters.proposedItems.find(eqItem(item)) || context.state.standardItems.find(eqItem(item))
    if (existing) {
      changes.push({ ...existing, amount: -existing.amount })
    }
    context.commit(CHANGES_CHANGED, { changes })
  },

  [RESTORE_ITEM](context, { item }) {
    const changes = context.state.changes.filter(neItem(item))
    context.commit(CHANGES_CHANGED, { changes })
  },

  async [ADD_ITEM](context, { item }) {
    async function createNewItem(newItem) {
      const item = await doFetch('post', '/ingredients', newItem)
      context.commit(INGREDIENTS_LOADED, { ingredients: [ ...context.state.allIngredients, item ] })
      return item
    }

    async function getChangedChanges(item) {
      const existing = context.state.changes.find(eqItem(item))
      if (existing) {
        const cmpFunc = eqItem(item)
        const replaceItem = { ...existing, amount: +existing.amount + item.amount }
        return context.state.changes.map(i => cmpFunc(i) ? replaceItem : i)
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

  async [UPDATE_AMOUNT](context, { item, newAmount }) {
    function getChangedChanges(item, amount) {
      if (context.state.changes.find(eqItem(item))) {
        return context.state.changes.map(i => i.id !== item.id ? i : { ...i, amount })
      } else {
        return [ ...context.state.changes, { ...item, amount } ]
      }
    }

    const proposedItem = [...context.getters.proposedItems, ...context.state.standardItems].find(eqItem(item))
    const changes = getChangedChanges(item, proposedItem ? newAmount - proposedItem.amount : newAmount)
    context.commit(CHANGES_CHANGED, { changes })
  },

  [SHOPPING_DONE]: async (context) => {
    const data = {
      accepted: context.state.accepted,
      date: context.state.startDate.toISOString()
    }
    await doFetch('post', '/proposals/fix', data)
    context.commit(SHOPPING_DONE)
    loadData('/proposals', PROPOSALS_LOADED)(context)
  }
}
