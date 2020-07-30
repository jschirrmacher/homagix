import Vue from 'vue'
import router from 'vue-router'
import App from './App'

Vue.config.productionTip = false

new Vue({
  el: '#root',
  router,
  // store,
  components: { App },
  template: '<App/>'
})
