import 'should'
import store from './index'
import { REMOVE_ITEM, PROPOSALS_LOADED, SHOPPING_DONE, INGREDIENTS_LOADED, ACCEPTANCE_CHANGED, ADD_ITEM, CHANGES_CHANGED, RESTORE_ITEM } from './mutation_types'
import { dishes, ingredients } from './test_dishes'

describe('Store actions', () => {
  beforeEach(() => store.commit(SHOPPING_DONE))
  
  describe('ADD_ITEM', () => {
    it('should add amount to existing shopping list items', async () => {
      store.commit(INGREDIENTS_LOADED, { ingredients: Object.values(ingredients) })
      store.commit(PROPOSALS_LOADED, { dishes: Object.values(dishes) })
      store.commit(ACCEPTANCE_CHANGED, { accepted: [ dishes.brot.id ] })
      await store.dispatch(ADD_ITEM, { item: { ...ingredients.hefe, amount: 2 } })
      store.state.changes.map(item => ({ id: item.id, amount: item.amount })).should.deepEqual([{ id: 9, amount: 2 }])
    })

    it('should add extra items', async () => {
      const item = { ...ingredients.hefe, amount: 2 }
      store.commit(INGREDIENTS_LOADED, { ingredients: Object.values(ingredients) })
      store.commit(PROPOSALS_LOADED, { dishes: Object.values(dishes) })
      store.commit(ACCEPTANCE_CHANGED, { accepted: [ dishes.brot.id ] })
      await store.dispatch(ADD_ITEM, { item })
      store.state.changes[0].should.deepEqual(item)
    })

    it('should add extra items even if ingredient is unknown', async () => {
      const zucker = { name: 'Zucker', amount: 50, unit: 'g' }
      store.commit(INGREDIENTS_LOADED, { ingredients: Object.values(ingredients) })
      store.commit(PROPOSALS_LOADED, { dishes: Object.values(dishes) })
      store.commit(ACCEPTANCE_CHANGED, { accepted: [ dishes.brot.id ] })
      await store.dispatch(ADD_ITEM, { item: zucker })
      store.state.changes[0].should.deepEqual(zucker)
    })
  })
  
  describe('REMOVE_ITEM', () => {
    it('should remove shopping list items by creating a change item with negative amount', async () => {
      store.commit(INGREDIENTS_LOADED, { ingredients: Object.values(ingredients) })
      store.commit(PROPOSALS_LOADED, { dishes: Object.values(dishes) })
      store.commit(ACCEPTANCE_CHANGED, { accepted: [ dishes.brot.id ] })
      await store.dispatch(REMOVE_ITEM, { item: ingredients.mehl })
      store.state.changes.length.should.equal(1)
      store.state.changes[0].id.should.equal(ingredients.mehl.id)
      store.state.changes[0].amount.should.equal(-500)
    })

    it('should remove extra items completely', async () => {
      const item = { name: 'Zucker', amount: 50, unit: 'g'}
      store.commit(CHANGES_CHANGED, { changes: [item] })
      await store.dispatch(REMOVE_ITEM, { item })
      store.state.changes.length.should.equal(0)
    })
  }),

  describe('RESTORE_ITEM', () => {
    it('should restore original amount', async () => {
      store.commit(INGREDIENTS_LOADED, { ingredients: Object.values(ingredients) })
      store.commit(PROPOSALS_LOADED, { dishes: Object.values(dishes) })
      store.commit(ACCEPTANCE_CHANGED, { accepted: [ dishes.brot.id ] })
      await store.dispatch(REMOVE_ITEM, { item: ingredients.mehl })
      await store.dispatch(RESTORE_ITEM, { item: ingredients.mehl })
      store.state.changes.should.be.empty()
    })

    it('should restore original amount even if an additional amount was added', async () => {
      const item = { ...ingredients.mehl, amount: 100, unit: 'g' }
      store.commit(INGREDIENTS_LOADED, { ingredients: Object.values(ingredients) })
      store.commit(PROPOSALS_LOADED, { dishes: Object.values(dishes) })
      store.commit(ACCEPTANCE_CHANGED, { accepted: [ dishes.brot.id ] })
      await store.dispatch(ADD_ITEM, { item })
      await store.dispatch(REMOVE_ITEM, { item: ingredients.mehl })
      await store.dispatch(RESTORE_ITEM, { item: ingredients.mehl })
      store.state.changes.length.should.equal(0)
    })
  })
})
