import should from 'should'
import fs from 'fs'
import path from 'path'
import DishReader from './DishReader'
import MockFS from '../lib/MockFS'
import Store from '../EventStore/Store.mock'
import Models from '../models/MockedModel'
import { Ingredient } from '../models/ingredient'

const store = Store()
const models = Models({ store })
const events = models.getEvents()
const basePath = path.resolve(path.dirname(''), 'testdata')
const mockFS = MockFS({ basePath })

describe('DishReader', () => {
  beforeEach(() => {
    fs.rmdirSync(basePath, { recursive: true })
    fs.mkdirSync(path.resolve(basePath, 'dishes'), { recursive: true })
    store.eventList().length = 0
  })

  afterEach(() => {
    fs.rmdirSync(basePath, { recursive: true })
  })

  it('should dispatch a new dish', () => {
    mockFS.setupFiles({
      'dishes/1.yaml': "name: 'test dish'\nitems:\n  - 1 Stk item 1",
    })
    DishReader({ store, models }).loadData(basePath)
    const addedEvent = store
      .eventList()
      .find(event => event.type === 'dishAdded')

    should(addedEvent).deepEqual({ type: 'dishAdded', name: 'test dish', id: '1' })
  })

  it('should create new ingredients', () => {
    mockFS.setupFiles({
      'dishes/1.yaml': "name: 'test dish'\nitems:\n  - 1 Stk new item",
    })
    DishReader({ store, models }).loadData(basePath)
    const event = store
      .eventList()
      .find(event => event.type === 'ingredientAdded')
    should(event).containDeep({
      type: 'ingredientAdded',
      unit: 'Stk',
      name: 'new item',
    })
  })

  it('should use existing ingredients', () => {
    store.dispatch(events.ingredientAdded({ name: 'existing item', unit: 'g' } as Ingredient))
    store.eventList().length = 0
    mockFS.setupFiles({
      'dishes/1.yaml': "name: 'test dish'\nitems:\n  - 500 g existing item",
    })
    DishReader({ store, models }).loadData(basePath)
    should(
      store.eventList().find(event => event.type === 'ingredientAdded')
    ).be.undefined()
  })

  it('should assign all items of a dish', () => {
    mockFS.setupFiles({
      'dishes/1.yaml':
        "name: 'test dish'\nitems:\n  - 1 Stk new item\n  - 500 g other item",
    })
    DishReader({ store, models }).loadData(basePath)
    const events = store
      .eventList()
      .filter(event => event.type === 'ingredientAssigned')
    events.length.should.equal(2)
    should(events.find(item => item.dishId !== '1')).be.undefined()
  })

  it('should create ids for new ingredients', () => {
    mockFS.setupFiles({
      'dishes/1.yaml': "name: 'test dish'\nitems:\n  - 1 Stk item w/o id",
    })
    DishReader({ store, models }).loadData(basePath)
    const item = models.ingredient.getAll().pop()
    should(item && item.id).not.be.undefined()
    should(item && item.id).be.instanceOf(String)
    should(item && item.id).not.equal('')
  })

  it('should use a unit default', () => {
    mockFS.setupFiles({
      'dishes/1.yaml': "name: 'test dish'\nitems:\n  - 1 item w/o unit",
    })
    DishReader({ store, models }).loadData(basePath)
    const item = models.ingredient.getAll().pop()
    should(item && item.unit).equal('Stk')
  })
})
