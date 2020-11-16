import should from 'should'
import fs from 'fs'
import path from 'path'
import DishReader from './DishReader.js'
import MockFS from './MockFS.js'
import models from './MockedModel.js'
import Events from './Events.js'
import Location from './Location.js'
import { store, eventList } from './Store.mock.js'

const { DIRNAME } = Location(import.meta.url)

const events = Events({ models })

const basePath = path.resolve(DIRNAME, 'testdata')
const mockFS = MockFS({ basePath })

describe('DishReader', () => {
  beforeEach(() => {
    fs.rmdirSync(basePath, { recursive: true })
    fs.mkdirSync(path.resolve(basePath, 'dishes'), { recursive: true })
    eventList.length = 0
  })

  afterEach(() => {
    fs.rmdirSync(basePath, { recursive: true })
  })

  it('should dispatch a new dish', () => {
    mockFS.setupFiles({ 'dishes/1.yaml': "name: 'test dish'\nitems:\n  - 1 Stk item 1" })
    DishReader({ store, models, basePath }).loadData()
    eventList.find(event => event.type === 'dishAdded').should.deepEqual({type: 'dishAdded', name: 'test dish', id: '1'})
  })

  it('should create new ingredients', () => {
    mockFS.setupFiles({ 'dishes/1.yaml': "name: 'test dish'\nitems:\n  - 1 Stk new item" })
    DishReader({ store, models, basePath }).loadData()
    const event = eventList.find(event => event.type === 'ingredientAdded')
    event.should.containDeep({type: 'ingredientAdded', unit: 'Stk', name: 'new item'})
  })
  
  it('should use existing ingredients', () => {
    store.dispatch(events.ingredientAdded({name: 'existing item', unit: 'g'}))
    eventList.length = 0
    mockFS.setupFiles({ 'dishes/1.yaml': "name: 'test dish'\nitems:\n  - 500 g existing item" })
    DishReader({ store, models, basePath }).loadData()
    should(eventList.find(event => event.type === 'ingredientAdded')).be.undefined()
  })

  it('should assign all items of a dish', () => {
    mockFS.setupFiles({ 'dishes/1.yaml': "name: 'test dish'\nitems:\n  - 1 Stk new item\n  - 500 g other item" })
    DishReader({ store, models, basePath }).loadData()
    const events = eventList.filter(event => event.type === 'ingredientAssigned')
    events.length.should.equal(2)
    should(events.find(item => item.dishId !== '1')).be.undefined()
  })

  it('should create ids for new ingredients', () => {
    mockFS.setupFiles({ 'dishes/1.yaml': "name: 'test dish'\nitems:\n  - 1 Stk item w/o id" })
    DishReader({ store, models, basePath }).loadData()
    const item = models.ingredient.getAll().pop()
    should(item.id).not.be.undefined()
    item.id.should.be.instanceOf(String)
    item.id.should.not.equal('')
  })

  it('should use a unit default', () => {
    mockFS.setupFiles({ 'dishes/1.yaml': "name: 'test dish'\nitems:\n  - 1 item w/o unit" })
    DishReader({ store, models, basePath }).loadData()
    const item = models.ingredient.getAll().pop()
    item.unit.should.equal('Stk')
  })
})
