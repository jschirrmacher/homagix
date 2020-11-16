import 'should'
import fetch from 'node-fetch'
import nock from 'nock'
import store from './index.js'
import { REMOVE_ITEM, PROPOSALS_LOADED, INGREDIENTS_LOADED, ACCEPTANCE_CHANGED, ADD_ITEM, CHANGES_CHANGED, RESTORE_ITEM, UPDATE_AMOUNT, RESET_STORE } from './mutation_types.js'
import { dishes, ingredients } from './test_dishes.js'
import { setBaseUrl } from '../lib/api.js'

const baseName = 'http://test'
setBaseUrl(baseName)

const standards = [
  { id: '1234', name: 'standard item', unit: 'g', amount: 200 },
]

describe('Store actions', () => {
  beforeEach(async () => {
    global.fetch = await fetch  
    store.commit(RESET_STORE)
  })
  
  describe('ADD_ITEM', () => {
    it('should add amount to existing shopping list items', async () => {
      store.commit(INGREDIENTS_LOADED, { ingredients: Object.values(ingredients), standards })
      store.commit(PROPOSALS_LOADED, { dishes: Object.values(dishes) })
      store.commit(ACCEPTANCE_CHANGED, { accepted: [ dishes.brot.id ] })
      await store.dispatch(ADD_ITEM, { item: { ...ingredients.hefe, amount: 2 } })
      store.state.changes.map(item => ({ id: item.id, amount: item.amount })).should.deepEqual([{ id: 9, amount: 2 }])
    })

    it('should add extra items', async () => {
      const item = { ...ingredients.hefe, amount: 2 }
      store.commit(INGREDIENTS_LOADED, { ingredients: Object.values(ingredients), standards })
      store.commit(PROPOSALS_LOADED, { dishes: Object.values(dishes) })
      store.commit(ACCEPTANCE_CHANGED, { accepted: [ dishes.brot.id ] })
      await store.dispatch(ADD_ITEM, { item })
      store.state.changes[0].should.deepEqual(item)
    })

    it('should add extra items even if ingredient is unknown', async () => {
      const zucker = { name: 'Zucker', amount: 50, unit: 'g' }
      nock(baseName).post('/ingredients').reply(200, { ...zucker, id: '1234-5678'})
      store.commit(INGREDIENTS_LOADED, { ingredients: Object.values(ingredients), standards })
      store.commit(PROPOSALS_LOADED, { dishes: Object.values(dishes) })
      store.commit(ACCEPTANCE_CHANGED, { accepted: [ dishes.brot.id ] })
      await store.dispatch(ADD_ITEM, { item: zucker })
      store.state.changes[0].should.containDeep(zucker)
    })
  })
  
  describe('REMOVE_ITEM', () => {
    it('should remove shopping list items by creating a change item with negative amount', async () => {
      store.commit(INGREDIENTS_LOADED, { ingredients: Object.values(ingredients), standards })
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

    it('should keep existing changes if a proposed item is removed', async () => {
      const item = { name: 'Zucker', amount: 50, unit: 'g'}
      store.commit(INGREDIENTS_LOADED, { ingredients: Object.values(ingredients), standards })
      store.commit(PROPOSALS_LOADED, { dishes: Object.values(dishes) })
      store.commit(ACCEPTANCE_CHANGED, { accepted: [ dishes.brot.id ] })
      store.commit(CHANGES_CHANGED, { changes: [item] })
      await store.dispatch(REMOVE_ITEM, { item: ingredients.mehl })
      store.state.changes.some(item => item.name === 'Zucker').should.be.true()
    })

    it('should create a change with negative amount for standard items', async () => {
      store.commit(INGREDIENTS_LOADED, { ingredients: Object.values(ingredients), standards })
      await store.dispatch(REMOVE_ITEM, { item: standards[0] })
      store.state.changes.map(item => ({ ...item })).should.deepEqual([{ ...standards[0], amount: -standards[0].amount }])
    })

    it('should create a change with the negative amount of an item which was both, proposed and standard', async () => {
      store.commit(INGREDIENTS_LOADED, { ingredients: Object.values(ingredients), standards: [{ ...ingredients.mehl, amount: 123 }] })
      store.commit(PROPOSALS_LOADED, { dishes: Object.values(dishes) })
      store.commit(ACCEPTANCE_CHANGED, { accepted: [ dishes.brot.id ] })
      await store.dispatch(REMOVE_ITEM, { item: ingredients.mehl })
      store.state.changes.map(item => ({ id: item.id, amount: item.amount })).should.deepEqual([{ id: ingredients.mehl.id, amount: -dishes.brot.items[0].amount - 123 }])
    })
  }),

  describe('RESTORE_ITEM', () => {
    it('should restore original amount', async () => {
      store.commit(INGREDIENTS_LOADED, { ingredients: Object.values(ingredients), standards })
      store.commit(PROPOSALS_LOADED, { dishes: Object.values(dishes) })
      store.commit(ACCEPTANCE_CHANGED, { accepted: [ dishes.brot.id ] })
      await store.dispatch(REMOVE_ITEM, { item: ingredients.mehl })
      await store.dispatch(RESTORE_ITEM, { item: ingredients.mehl })
      store.state.changes.should.be.empty()
    })

    it('should restore original amount even if an additional amount was added', async () => {
      const item = { ...ingredients.mehl, amount: 100, unit: 'g' }
      store.commit(INGREDIENTS_LOADED, { ingredients: Object.values(ingredients), standards })
      store.commit(PROPOSALS_LOADED, { dishes: Object.values(dishes) })
      store.commit(ACCEPTANCE_CHANGED, { accepted: [ dishes.brot.id ] })
      await store.dispatch(ADD_ITEM, { item })
      await store.dispatch(REMOVE_ITEM, { item: ingredients.mehl })
      await store.dispatch(RESTORE_ITEM, { item: ingredients.mehl })
      store.state.changes.length.should.equal(0)
    })
  })

  describe('UPDATE_AMOUNT', () => {
    it('should change amount of proposed items', async () => {
      store.commit(INGREDIENTS_LOADED, { ingredients: Object.values(ingredients), standards })
      store.commit(PROPOSALS_LOADED, { dishes: Object.values(dishes) })
      store.commit(ACCEPTANCE_CHANGED, { accepted: [ dishes.brot.id ] })
      await store.dispatch(UPDATE_AMOUNT, { item: ingredients.hefe, newAmount: 3 })
      store.state.changes.map(item => ({ id: item.id, amount: item.amount })).should.deepEqual([{ id: 9, amount: 2 }])
    })

    it('should change amount of standard items', async () => {
      store.commit(INGREDIENTS_LOADED, { ingredients: Object.values(ingredients), standards })
      await store.dispatch(UPDATE_AMOUNT, { item: standards[0], newAmount: 150 })
      store.state.changes.map(item => ({ id: item.id, amount: item.amount })).should.deepEqual([{ id: '1234', amount: -50 }])
    })

    it('should change amount of individual items', async () => {
      const item = { name: 'Zucker', amount: 50, unit: 'g'}
      store.commit(CHANGES_CHANGED, { changes: [item] })
      await store.dispatch(UPDATE_AMOUNT, { item, newAmount: 80 })
      store.state.changes.map(item => item.amount).should.deepEqual([80])
    })

    it('should change amount of changed proposed items', async () => {
      store.commit(INGREDIENTS_LOADED, { ingredients: Object.values(ingredients), standards })
      store.commit(PROPOSALS_LOADED, { dishes: Object.values(dishes) })
      store.commit(ACCEPTANCE_CHANGED, { accepted: [ dishes.brot.id ] })
      await store.dispatch(ADD_ITEM, { item: { ...ingredients.hefe, amount: 2 } })
      await store.dispatch(UPDATE_AMOUNT, { item: ingredients.hefe, newAmount: 4 })
      store.state.changes.map(item => ({ id: item.id, amount: item.amount })).should.deepEqual([{ id: 9, amount: 3 }])
    })
  })
})
