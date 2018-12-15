/* eslint-env node, mocha */

const should = require('should')
const Model = require('./Model')

const dish = {id: 47, name: 'Test dish 1'}
const eventDishAdded = Object.assign({type: 'dish-added'}, dish)
const ingredient = {id: 1, name: 'Ing 1'}
const eventIngredientAdded = Object.assign({type: 'ingredient-added'}, ingredient)

describe('Model', () => {
  beforeEach(() => {
    this.eventStore = new EventStoreMock([eventDishAdded, eventIngredientAdded])
    this.OUT = new Model({eventStore: this.eventStore})
  })

  it('should return a list of dishes', () => {
    const dishes = this.OUT.getDishes()
    dishes.should.be.an.instanceOf(Array)
    dishes.should.deepEqual([dish])
  })

  it('should return a requested dish', () => {
    this.OUT.getDish(47).should.deepEqual(dish)
  })

  it('should persist changes in EventStore', () => {
    const dish = this.OUT.getDish(47)
    dish.name += ' changed'
    this.OUT.persistChanges()
    this.eventStore.persistChangesIsCalled.should.be.true()
    const events = this.eventStore.getEvents()
    events.length.should.equal(3)
    events[2].should.deepEqual({type: 'dish-updated', id: 47, name: 'name', value: 'Test dish 1 changed'})
  })

  it('should return a list of ingredients', () => {
    const ingredients = this.OUT.getIngredients()
    ingredients.should.be.an.instanceOf(Array)
    ingredients.should.deepEqual([ingredient])
  })

  it('should return a requested ingredient', () => {
    this.OUT.getIngredient(1).should.deepEqual(ingredient)
  })

  it('should return undefined if a dish or an ingredient could not be found', () => {
    should(this.OUT.getDish(77)).be.undefined()
    should(this.OUT.getIngredient(2)).be.undefined()
  })
})

class EventStoreMock {
  constructor(events) {
    this.events = events
    this.persistChangesIsCalled = false
  }

  getEvents() {
    return this.events
  }

  applyChanges() {
  }

  add(event) {
    this.events.push(event)
  }

  persistChanges() {
    this.persistChangesIsCalled = true
  }
}
