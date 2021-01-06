import Vue from 'vue'
import router from './router'
import App from './App'
import store from './store'
import { INIT_APP } from './store/action_types'

Vue.config.productionTip = false

new Vue({
  el: '#root',
  router,
  store,
  components: { App },
  template: '<App/>',
})

store.dispatch(INIT_APP)
