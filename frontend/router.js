import Vue from 'vue'
import VueRouter from 'vue-router'
import Planner from '@/views/Planner'
import RecipesList from '@/views/RecipesList'
import Recipe from '@/views/Recipe'
import ChangePasswordView from '@/views/ChangePasswordView'
import RegisterView from '@/views/RegisterView'
import NotFoundComponent from '@/views/NotFoundComponent'
import store from '@/store'
import { LOAD_DISHES } from '@/store/action_types'
import { openDialog } from '@/lib/dialogs'

Vue.use(VueRouter)

export default new VueRouter({
  mode: 'history',
  base: __dirname,
  routes: [
    { name: 'home', path: '/', redirect: '/recipes' },
    {
      name: 'planner',
      path: '/planner',
      component: Planner,
      async beforeEnter(to, from, next) {
        if (store.state.currentUser.id) {
          next()
        } else if (openDialog('LoginDialog')) {
          next(false)
        } else {
          next('/')
        }
      }
    },
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
    { name: 'set-password', path: '/setPassword', component: ChangePasswordView },
    { name: 'register', path: '/register', component: RegisterView },
    { path: '*', component: NotFoundComponent }
  ]
})

function dishExists(id) {
  return store.state.dishes.find(dish => dish.id === id)
}

