import 'should'
import store from '.'
import {
  INGREDIENTS_LOADED,
  ACCEPTANCE_CHANGED,
  CHANGES_CHANGED,
  RESET_STORE,
  WEEKPLAN_LOADED,
  DISHES_LOADED,
  STANDARD_ITEMS_LOADED,
} from './mutation_types'
import { dishes, ingredients } from './test_dishes'

describe('Store getters', () => {
  beforeEach(() => {
    store.commit(RESET_STORE)
    store.commit(INGREDIENTS_LOADED, {
      allIngredients: Object.values(ingredients),
    })
    store.commit(STANDARD_ITEMS_LOADED, { standardItems: [] })
    store.commit(DISHES_LOADED, { dishes: Object.values(dishes) })
    store.commit(WEEKPLAN_LOADED, {
      weekplan: Object.values(dishes).map(dish => ({
        date: dish.last,
        dishId: dish.id,
        served: true,
      })),
    })
  })

  describe('shoppinglist', () => {
    it('should return no ingredients if there are no accepted dishes', () => {
      store.getters.shoppinglist.length.should.equal(0)
    })

    it('should return only ingredients of accepted dishes', () => {
      store.commit(ACCEPTANCE_CHANGED, { accepted: [dishes.brot.id] })
      store.getters.shoppinglist
        .map(item => item.id)
        .should.deepEqual([ingredients.hefe.id, ingredients.mehl.id])
    })

    it('should add amounts of ingredients', () => {
      store.commit(ACCEPTANCE_CHANGED, {
        accepted: [dishes.brot.id, dishes.kuchen.id],
      })
      store.getters.shoppinglist
        .map(item => item.amount)
        .should.containDeep([850, 1.5, 3])
    })

    it('should return a sorted list', () => {
      store.commit(ACCEPTANCE_CHANGED, { accepted: [dishes.brot.id] })
      store.getters.shoppinglist
        .map(item => item.name)
        .should.deepEqual(['Hefe', 'Mehl'])
    })
  })

  describe('itemsInShoppingList', () => {
    it('should return false if there are no items in the shopping list', () => {
      store.getters.itemsInShoppingList.should.be.false()
    })

    it('should return true if there are items in the shopping list', () => {
      store.commit(ACCEPTANCE_CHANGED, { accepted: [dishes.brot.id] })
      store.getters.itemsInShoppingList.should.be.true()
    })

    it('should return false, if all items have an amount of zero', () => {
      const changes = dishes.brot.items.map(item => ({
        ...item,
        amount: -item.amount,
      }))
      store.commit(ACCEPTANCE_CHANGED, { accepted: [dishes.brot.id] })
      store.commit(CHANGES_CHANGED, { changes })
      store.getters.itemsInShoppingList.should.be.false()
    })

    it('should return true if there is an extra item in the list', () => {
      const changes = [{ name: 'Zucker', amount: 50, unit: 'g' }]
      store.commit(CHANGES_CHANGED, { changes })
      store.getters.itemsInShoppingList.should.be.true()
    })
  })

  describe('maxServedDate', () => {
    it('should return the maximum served date from the dishes', () => {
      store.getters.maxServedDate.should.equal('2021-01-25')
    })
  })

  describe('nextDayToServe', () => {
    it('should return the date of the next day when dishes should be served', () => {
      store.getters.nextDayToServe.should.equal('2021-01-26')
    })
  })
})
