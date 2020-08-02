import Vue from 'vue'
import Vuex from 'vuex'
import * as types from './mutation_types'

Vue.use(Vuex)

const itemGroups = {
  fruit: { order: 1, title: 'Obst & Gemüse' },
  breakfast: { order: 2, title: 'Brot & Frühstück' },
  meat: { order: 3, title: 'Fleisch' },
  cooled: { order: 4, title: 'Frische & Kühlung' },
  tinned: { order: 5, title: 'Nahrungsmittel' },
  drinks: { order: 6, title: 'Getränke' },
  frozen: { order: 7, title: 'Tiefgekühlt' },
  other: { order: 8, title: 'Sonstiges' }
}

function loadData(url, mutationType) {
  return async function (context) {
    const params = [
      'accepted=' + context.state.accepted.join(','),
      'inhibit=' + context.state.declined.join(','),
    ]
    const result = await fetch(url + '?' + params.join('&'))
    if (result.ok) {
      context.commit(mutationType, await result.json())
    } else {
      context.commit(types.ERROR_OCCURED, { message: 'Cannot load dish proposals', details: await result.json() })
    }
  }
}

function addIfNotAlreadyIn(array, element) {
  const existing = array.findIndex(el => el.id === element.id)
  if (existing !== -1) {
    if (array[existing].unit !== element.unit) {
      throw Error(`Problem: ingredient '${element.name}' is specified with different units!`)
    }
    return array.map(el => el.id === element.id ? {...el, amount: el.amount + element.amount} : el)
  } else {
    return [...array, element]
  }
}

export default new Vuex.Store({
  strict: true,

  state: {
    proposals: [],
    selectedIngredients: [],
    allIngredients: [],
    extras: [],
    accepted: [],
    declined: [],
    error: {}
  },

  getters: {
    shoppinglist(state) {
      return state.proposals
        .filter(p => state.accepted.includes(p.id))
        .map(p => p.ingredients)
        .flat()
        .concat(state.extras)
        .reduce(addIfNotAlreadyIn, [])
        .map(i => {
          const item = state.allIngredients.find(item => item.id === i.id)
          return { ...i, name: item.name, group: { ...itemGroups[item.group], id: item.group }}
        })
        .sort((a, b) => a.group.order - b.group.order)
    },
  },

  mutations: {
    [types.CLEAR_ERROR](state) {
      state.error = {}
    },

    [types.PROPOSALS_LOADED](state, { dishes, ingredients }) {
      state.proposals = dishes
      state.selectedIngredients = ingredients
    },

    [types.INGREDIENTS_LOADED](state, ingredients) {
      state.allIngredients = ingredients
    },

    [types.DISH_ACCEPTED](state, { dishId }) {
      if (state.accepted.includes(dishId)) {
        state.accepted = state.accepted.filter(id => id !== dishId)
      } else {
        state.accepted.push(dishId)
      }
    },

    [types.DISH_DECLINED](state, { dishId }) {
      if (state.declined.includes(dishId)) {
        state.declined = state.declined.filter(id => id !== dishId)
      } else {
        state.declined.push(dishId)
      }
    },
  },

  actions: {
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
  },
})
