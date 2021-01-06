import 'should'
import fetch from 'node-fetch'
import nock from 'nock'
import store from './index.js'
import { REMOVE_ITEM, INGREDIENTS_LOADED, ACCEPTANCE_CHANGED, ADD_ITEM, CHANGES_CHANGED, RESTORE_ITEM, UPDATE_AMOUNT, RESET_STORE, STARTDATE_CHANGED, WEEKPLAN_LOADED, DISHES_LOADED } from './mutation_types.js'
import { dishes, ingredients } from './test_dishes.js'
import { setBaseUrl } from '../lib/api.js'
import { CHANGE_STARTDATE } from './action_types.js'

const baseName = 'http://test'
setBaseUrl(baseName)

const standards = [
  { id: '1234', name: 'standard item', unit: 'g', amount: 200 },
]

function setupStore(standards) {
  store.commit(INGREDIENTS_LOADED, { ingredients: Object.values(ingredients), standards })
  store.commit(DISHES_LOADED, { dishes: Object.values(dishes) })
  store.commit(WEEKPLAN_LOADED, { weekplan: Object.values(dishes).map(dish => ({ date: dish.lastServed, dishId: dish.id, served: true })) })
  store.commit(ACCEPTANCE_CHANGED, { accepted: [ dishes.brot.id ] })
}

describe('Store actions', () => {
  beforeEach(async () => {
    global.fetch = await fetch  
    store.commit(RESET_STORE)
  })

  describe('CHANGE_STARTDATE', () => {
    it('should set the new start date', async () => {
      const xmas = new Date('2020-12-24')
      store.commit(STARTDATE_CHANGED, { startDate: '2020-12-20' })
      nock(baseName).get('/weekplan/2020-12-24?inhibit=').reply(200, [])
      await store.dispatch(CHANGE_STARTDATE, { startDate: xmas })
      store.state.startDate.should.deepEqual(xmas)
    })

    it('should fetch the new week plan', async () => {
      const request = nock(baseName).get('/weekplan/2020-12-24?inhibit=').reply(200, [])
      await store.dispatch(CHANGE_STARTDATE, { startDate: new Date('2020-12-24') })
      request.isDone().should.be.true()
    })

    it('should store the new weekplan', async () => {
      const weekplan = [{ date: '2020-12-24', dish: { id: 4711 }, served: false }]
      nock(baseName).get('/weekplan/2020-12-24?inhibit=').reply(200, weekplan)
      await store.dispatch(CHANGE_STARTDATE, { startDate: new Date('2020-12-24') })
      JSON.stringify(store.state.weekplan).should.deepEqual(JSON.stringify(weekplan))
    })
  })
  
  describe('ADD_ITEM', () => {
    it('should add amount to existing shopping list items', async () => {
      setupStore(standards)
      await store.dispatch(ADD_ITEM, { item: { ...ingredients.hefe, amount: 2 } })
      store.state.changes.map(item => ({ id: item.id, amount: item.amount })).should.deepEqual([{ id: 9, amount: 2 }])
    })

    it('should add extra items', async () => {
      const item = { ...ingredients.hefe, amount: 2 }
      setupStore(standards)
      await store.dispatch(ADD_ITEM, { item })
      store.state.changes[0].should.deepEqual(item)
    })

    it('should add extra items even if ingredient is unknown', async () => {
      const zucker = { name: 'Zucker', amount: 50, unit: 'g' }
      nock(baseName).post('/ingredients').reply(200, { ...zucker, id: '1234-5678'})
      setupStore(standards)
      await store.dispatch(ADD_ITEM, { item: zucker })
      store.state.changes[0].should.containDeep(zucker)
    })
  })
  
  describe('REMOVE_ITEM', () => {
    it('should remove shopping list items by creating a change item with negative amount', async () => {
      setupStore(standards)
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
      setupStore(standards)
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
      setupStore([{ ...ingredients.mehl, amount: 123 }])
      await store.dispatch(REMOVE_ITEM, { item: ingredients.mehl })
      store.state.changes.map(item => ({ id: item.id, amount: item.amount })).should.deepEqual([{ id: ingredients.mehl.id, amount: -dishes.brot.items[0].amount - 123 }])
    })
  }),

  describe('RESTORE_ITEM', () => {
    it('should restore original amount', async () => {
      setupStore(standards)
      await store.dispatch(REMOVE_ITEM, { item: ingredients.mehl })
      await store.dispatch(RESTORE_ITEM, { item: ingredients.mehl })
      store.state.changes.should.be.empty()
    })

    it('should restore original amount even if an additional amount was added', async () => {
      const item = { ...ingredients.mehl, amount: 100, unit: 'g' }
      setupStore(standards)
      await store.dispatch(ADD_ITEM, { item })
      await store.dispatch(REMOVE_ITEM, { item: ingredients.mehl })
      await store.dispatch(RESTORE_ITEM, { item: ingredients.mehl })
      store.state.changes.length.should.equal(0)
    })
  })

  describe('UPDATE_AMOUNT', () => {
    it('should change amount of proposed items', async () => {
      setupStore(standards)
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
      setupStore(standards)
      await store.dispatch(ADD_ITEM, { item: { ...ingredients.hefe, amount: 2 } })
      await store.dispatch(UPDATE_AMOUNT, { item: ingredients.hefe, newAmount: 4 })
      store.state.changes.map(item => ({ id: item.id, amount: item.amount })).should.deepEqual([{ id: 9, amount: 3 }])
    })
  })
})
