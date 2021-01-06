import 'should'
import express from 'express'
import request from 'supertest'
import Router from './DishesRouter.js'
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
const router = Router({ models, store, auth, jsonResult })
const app = express()
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
    store.emit(models.getEvents().dishAdded({ id: '4711', name: 'Butter' }))
    store.emit(models.getEvents().addDishToList('4711', '42'))
    const result = await request(app).get('/')
    result.body.dishes.should.deepEqual([
      { id: '4711', name: 'Butter', items: [], isFavorite: true },
    ])
  })

  it('should mark dishes as favorite', async () => {
    store.emit(models.getEvents().dishAdded({ id: '4711', name: 'Butter' }))
    await request(app).post('/4711/favorites')
    models.dishList.getById('42').should.deepEqual(['4711'])
  })

  it('should return the dish when it was marked as favorite', async () => {
    store.emit(models.getEvents().dishAdded({ id: '4711', name: 'Butter' }))
    const result = await request(app).post('/4711/favorites')
    result.ok.should.be.true()
    result.body.should.not.have.a.property('error')
    result.body.should.have.a.property('isFavorite')
    result.body.isFavorite.should.be.true()
  })

  it('should remove favorite mark from dish', async () => {
    store.emit(models.getEvents().dishAdded({ id: '4711', name: 'Butter' }))
    store.emit(models.getEvents().addDishToList('4711', '42'))
    await request(app).delete('/4711/favorites')
    models.dishList.getById('42').should.deepEqual([])
  })

  it('should return the dish when the favorite mark was removed', async () => {
    store.emit(models.getEvents().dishAdded({ id: '4711', name: 'Butter' }))
    store.emit(models.getEvents().addDishToList('4711', '42'))
    const result = await request(app).delete('/4711/favorites')
    result.ok.should.be.true()
    result.body.should.not.have.a.property('error')
    result.body.should.have.a.property('isFavorite')
    result.body.isFavorite.should.be.false()
  })
})
