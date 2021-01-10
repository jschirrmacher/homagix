import 'should'
import express from 'express'
import request from 'supertest'
import bodyParser from 'body-parser'
import Router from './DishesRouter.js'
import DishReader from './DishReader.js'
import Store from './EventStore/Store.mock.js'
import Models from './models/MockedModel.js'

const testUser = { id: '42' }
const auth = {
  requireJWT: () => (req, res, next) => {
    req.user = testUser
    next()
  },
}
const store = Store()
const models = Models({ store })
const jsonResult = func => async (req, res) => res.json(await func(req))
const dishReader = DishReader({ store, models })
const router = Router({ models, store, auth, jsonResult, dishReader })
const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(router)

describe('DishesRouter', () => {
  beforeEach(() => {
    models.dish.reset()
  })

  it('should return a json list of dishes', async () => {
    const result = await request(app).get('/')
    result.ok.should.be.true()
    result.body.should.not.have.a.property('error')
    result.body.should.have.a.property('dishes')
  })

  it('should mark favorites in list', async () => {
    store.emit(models.getEvents().dishAdded({ id: '4711', name: 'Pancake' }))
    store.emit(models.getEvents().addDishToList('4711', '42'))
    const result = await request(app).get('/')
    result.body.dishes.should.deepEqual([
      { id: '4711', name: 'Pancake', items: [], isFavorite: true },
    ])
  })

  it('should mark dishes as favorite', async () => {
    store.emit(models.getEvents().dishAdded({ id: '4711', name: 'Pancake' }))
    await request(app).post('/4711/favorites')
    models.dishList.getById('42').should.deepEqual(['4711'])
  })

  it('should return the dish when it was marked as favorite', async () => {
    store.emit(models.getEvents().dishAdded({ id: '4711', name: 'Pancake' }))
    const result = await request(app).post('/4711/favorites')
    result.ok.should.be.true()
    result.body.should.not.have.a.property('error')
    result.body.should.have.a.property('isFavorite')
    result.body.isFavorite.should.be.true()
  })

  it('should remove favorite mark from dish', async () => {
    store.emit(models.getEvents().dishAdded({ id: '4711', name: 'Pancake' }))
    store.emit(models.getEvents().addDishToList('4711', '42'))
    await request(app).delete('/4711/favorites')
    models.dishList.getById('42').should.deepEqual([])
  })

  it('should return the dish when the favorite mark was removed', async () => {
    store.emit(models.getEvents().dishAdded({ id: '4711', name: 'Pancake' }))
    store.emit(models.getEvents().addDishToList('4711', '42'))
    const result = await request(app).delete('/4711/favorites')
    result.ok.should.be.true()
    result.body.should.not.have.a.property('error')
    result.body.should.have.a.property('isFavorite')
    result.body.isFavorite.should.be.false()
  })

  it('should add a dish', async () => {
    const items = [{ amount: 1, unit: 'Stk', name: 'Bun' }, { amount: 1, unit: 'Stk', name: 'Patty' }]
    const result = await request(app).post('/').send({ name: 'Hamburger', items })
    result.ok.should.be.true()
    result.body.id.should.not.be.empty()
    result.body.name.should.equal('Hamburger')
    const saved = models.dish.byId(result.body.id)
    saved.should.not.be.empty()
    saved.name.should.equal('Hamburger')
    saved.items.should.be.an.Array()
    saved.items.map(i => ({ ...models.ingredient.byId(i.id), amount: i.amount })).should.containDeep(items)
  })

  it('should update the title of a dish', async () => {
    store.emit(models.getEvents().dishAdded({ id: '4711', name: 'Pancake' }))
    const result = await request(app).patch('/4711').send({ name: 'Hamburger' })
    result.ok.should.be.true()
    result.body.id.should.equal('4711')
    result.body.name.should.equal('Hamburger')
    models.dish.byId(4711).name.should.equal('Hamburger')
  })

  it('should ignore unknown properties of a dish', async () => {
   store.emit(models.getEvents().dishAdded({ id: '4711', name: 'Pancake' }))
    const result = await request(app).patch('/4711').send({ unknown: 'value' })
    result.ok.should.be.true()
    models.dish.byId(4711).should.deepEqual({ id: '4711', name: 'Pancake', items: [] })
  })

  it('should add ingredients to a dish')
  
  it('should remove ingredients from a dish')
  
  it('should update the recipe of a dish')
  
  it('should update the image of a dish')

  it('should not allow to create dishes when not authenticated')

  it('should not allow to update dishes when not authenticated')
})
