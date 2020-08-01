import Vue from 'vue'
import Vuex from 'vuex'
import { ERROR_OCCURED, CLEAR_ERROR, GET_PROPOSALS, PROPOSALS_LOADED } from './mutation_types'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    proposals: [],
    ingredients: [],
    accepted: [],
    declined: [],
    error: {}
  },

  getters: {},
  mutations: {
    [CLEAR_ERROR](state) {
      state.error = {}
    },

    [PROPOSALS_LOADED](state, { proposals }) {
      state.proposals = proposals.dishes
      state.ingredients = proposals.ingredients
    }
  },

  actions: {
    async [GET_PROPOSALS](context) {
      const result = await fetch('/proposals')
      if (result.ok) {
        context.commit(PROPOSALS_LOADED, { proposals: await result.json() })
      } else {
        context.commit(ERROR_OCCURED, { message: 'Cannot load dish proposals', details: await result.json() })
      }
    }
  },
})
