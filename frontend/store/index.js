import Vue from 'vue'
import Vuex from 'vuex'
import { ERROR_OCCURED, CLEAR_ERROR, GET_PROPOSALS, PROPOSALS_LOADED, GET_INGREDIENTS, INGREDIENTS_LOADED } from './mutation_types'

Vue.use(Vuex)

async function loadData(url, context, mutationType) {
  const result = await fetch(url)
  if (result.ok) {
    context.commit(mutationType, await result.json())
  } else {
    context.commit(ERROR_OCCURED, { message: 'Cannot load dish proposals', details: await result.json() })
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
    shoppinglist() {
      return this.$store.proposals
        .filter(p => this.$store.accepted.includes(p.id))
        .map(p => p.ingredients)
        .flat()
        + this.$store.state.extras
    }
  },

  mutations: {
    [CLEAR_ERROR](state) {
      state.error = {}
    },

    [PROPOSALS_LOADED](state, { dishes, ingredients }) {
      state.proposals = dishes
      state.selectedIngredients = ingredients
    },

    [INGREDIENTS_LOADED](state, ingredients) {
      state.allIngredients = ingredients
    }
  },

  actions: {
    [GET_PROPOSALS]: (context) => loadData('/proposals', context, PROPOSALS_LOADED),
    [GET_INGREDIENTS]: (context) => loadData('/ingredients', context, INGREDIENTS_LOADED),
  },
})
