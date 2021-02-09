import Vue from 'vue'
import Vuex from 'vuex'
import { state, State } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'

Vue.use(Vuex)

export default new Vuex.Store<State>({
  strict: true,

  state,
  getters,
  mutations,
  actions,
})
