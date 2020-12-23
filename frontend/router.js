import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/components/Home'
import RecipesList from '@/components/RecipesList'

Vue.use(VueRouter)

export default new VueRouter({
  mode: 'history',
  base: __dirname,
  routes: [
    { name: 'home', path: '/', component: Home },
    { name: 'recipes', path: '/recipes', component: RecipesList }
  ]
})
