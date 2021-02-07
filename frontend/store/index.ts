import Vue from 'vue'
import Vuex from 'vuex'
import { state } from './state'
import { getters } from './getters'
import { mutations } from './mutations'
import { actions } from './actions'
import { State } from '../app-types'

Vue.use(Vuex)

export default new Vuex.Store<State>({
  strict: true,

  state,
  getters,
  mutations,
  actions,
})
