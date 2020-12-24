import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/components/Home'
import RecipesList from '@/components/RecipesList'
import Recipe from '@/components/Recipe'
import NotFoundComponent from '@/components/NotFoundComponent'

Vue.use(VueRouter)

export default new VueRouter({
  mode: 'history',
  base: __dirname,
  routes: [
    { name: 'home', path: '/', component: Home },
    { name: 'recipes', path: '/recipes', component: RecipesList },
    { name: 'recipe', path: '/recipes/:id', component: Recipe, props: true },
    { path: '*', component: NotFoundComponent }
  ]
})
