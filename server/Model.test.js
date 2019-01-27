/* eslint-env node, mocha */

const should = require('should')
const Model = require('./Model')

const dish = {id: 47, name: 'Test dish 1'}
const ingredient = {id: 1, name: 'Ing X'}

const eventDishAdded = Object.assign({type: 'dish-added'}, dish)
const eventDishUpdated = {type: 'dish-updated', id: 47, name: 'last', value: '2019-01-27'}
const eventIngredientAdded = Object.assign({type: 'ingredient-added'}, ingredient)
const eventIngredientUpdated = {type: 'ingredient-updated', id: 1, name: 'name', value: 'Ing 1'}
const eventStream = [
  eventDishAdded,
  eventIngredientAdded,
  eventDishUpdated,
  eventIngredientUpdated
]

const validCmd = {command: 'add-ingredient-to-dish', dish: 'Test dish 1', ingredient: 'Ing 1', amount: 500, unit: 'g'}
const invalidCmd1 = {command: 'add-ingredient-to-dish', dish: 'Test dish 2', ingredient: 'Ing 1', amount: 1, unit: 'L'}
const invalidCmd2 = {command: 'invalid-command'}
const commands = [
  validCmd,
  invalidCmd1,
  invalidCmd2
]

const completeDish = Object.assign({last: '2019-01-27', ingredients: [{ingredient: 1, amount: 500, unit: 'g'}]}, dish)
const completeIngredient = Object.assign({}, ingredient, {name: 'Ing 1'})

const log = []

describe('Model', () => {
  beforeEach(() => {
    this.eventStore = new EventStoreMock(eventStream, commands)
    log.length = 0
    this.OUT = new Model({eventStore: this.eventStore, logger: {
      error: message => log.push(message)
    }})
  })

  it('should return a list of dishes', () => {
    const dishes = this.OUT.getDishes()
    dishes.should.be.an.instanceOf(Array)
    dishes.should.deepEqual([completeDish])
  })

  it('should return a requested dish', () => {
    this.OUT.getDish(47).should.deepEqual(completeDish)
  })

  it('should execute commands', () => {
    const events = this.eventStore.getEvents()
    const event = {type: 'ingredient-assigned', dish: 47, ingredient: 1, amount: 500, unit: 'g'}
    events[4].should.deepEqual(event)
  })

  it('should report invalid commands', () => {
    log.should.deepEqual([
      `Dish not found - command #2 'add-ingredient-to-dish' ignored`,
      `invalid command - command #3 'invalid-command' ignored`
    ])
  })

  it('should persist changes in EventStore', () => {
    const dish = this.OUT.getDish(47)
    dish.name += ' changed'
    this.OUT.persistChanges()
    this.eventStore.persistChangesIsCalled.should.be.true()
    const events = this.eventStore.getEvents()
    events.length.should.equal(6)
    events[5].should.deepEqual({type: 'dish-updated', id: 47, name: 'name', value: 'Test dish 1 changed'})
  })

  it('should return a list of ingredients', () => {
    const ingredients = this.OUT.getIngredients()
    ingredients.should.be.an.instanceOf(Array)
    ingredients.should.deepEqual([completeIngredient])
  })

  it('should return a requested ingredient', () => {
    this.OUT.getIngredient(1).should.deepEqual(completeIngredient)
  })

  it('should return undefined if a dish or an ingredient could not be found', () => {
    should(this.OUT.getDish(77)).be.undefined()
    should(this.OUT.getIngredient(2)).be.undefined()
  })
})

class EventStoreMock {
  constructor(events, commands) {
    this.events = JSON.parse(JSON.stringify(events))
    this.commands = commands
    this.persistChangesIsCalled = false
  }

  getEvents() {
    return this.events
  }

  applyChanges(commandHandler) {
    this.commands.forEach(commandHandler)
  }

  add(event) {
    this.events.push(event)
  }

  persistChanges() {
    this.persistChangesIsCalled = true
  }
}
