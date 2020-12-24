import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/components/Home'
import RecipesList from '@/components/RecipesList'
import Recipe from '@/components/Recipe'
import NotFoundComponent from '@/components/NotFoundComponent'
import store from './store'
import { LOAD_DISHES } from './store/action_types'

Vue.use(VueRouter)

export default new VueRouter({
  mode: 'history',
  base: __dirname,
  routes: [
    { name: 'home', path: '/', component: Home },
    { name: 'recipes', path: '/recipes', component: RecipesList },
    {
      name: 'recipe',
      path: '/recipes/:id/*',
      component: Recipe,
      props: true,
      async beforeEnter(to, from, next) {
        await store.dispatch(LOAD_DISHES)
        if (dishExists(to.params.id)) {
          next()
        } else {
          next('/unknown-dish')
        }
      },
      beforeUpdate(to, from, next) {
        next(dishExists(to.params.id))
      }
    },
    { path: '*', component: NotFoundComponent }
  ]
})

function dishExists(id) {
  return store.state.dishes.find(dish => dish.id === id)
}

