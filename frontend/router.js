import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/components/Home'
import WeekPlan from '@/components/WeekPlan'
import ShoppingList from '@/components/ShoppingList'

Vue.use(VueRouter)

export default new VueRouter({
  mode: 'hash',
  base: __dirname,
  routes: [
    { name: 'home', path: '/', component: Home },
    { name: 'weekplan', path: 'weekplan', component: WeekPlan },
    { name: 'shoppinglist', path: 'shoppinglist', component: ShoppingList },
  ]
})
