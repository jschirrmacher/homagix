import Vue from 'vue'
import Vuex from 'vuex'
import {} from './mutation_types'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    proposals: [{
      id: 1,
      name: 'Grüne Nudeln',
      last: '2020-07-30'
    }],
    accepted: [],
    declined: []
  },

  getters: {},
  mutations: {},
  actions: {},
})
