import Vue from 'vue'
import router from './router'
import App from './App.vue'
import store from './store'
import { INIT_APP } from './store/action_types'

Vue.config.productionTip = false

new Vue({
  components: { App },
  router,
  store,
  render(createElement) {
    return createElement(App)
  },
}).$mount("#root")

store.dispatch(INIT_APP)
