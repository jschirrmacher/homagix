import Vue from 'vue'
import router from './router'
import App from './App'
import store from './store'

Vue.config.productionTip = false

new Vue({
  el: '#root',
  router,
  store,
  components: { App },
  template: '<App/>'
})
