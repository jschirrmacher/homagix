import 'should'
import express from 'express'
import request from 'supertest'
import bodyParser from 'body-parser'
import Controller from './DishController.js'
import Router from './DishesRouter.js'
import DishReader from './DishReader.js'
import Store from '../EventStore/Store.mock.js'
import Models from '../models/MockedModel.js'
import auth, { validToken, adminToken } from '../auth/MockAuth.js'

const store = Store()
const models = Models({ store })
const jsonResult = func => async (req, res) => res.json(await func(req))
const dishReader = DishReader({ store, models })
const dishController = Controller({ store, models, dishReader })
const router = Router({ auth, jsonResult, dishController })
const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(router)

describe('DishesRouter', () => {
  beforeEach(() => {
    models.dish.reset()
    models.dishList.reset()
  })

  describe('GET /dishes', () => {
    it('should return a json list of dishes', async () => {
      const result = await request(app).get('/')
      result.ok.should.be.true()
      result.body.should.not.have.a.property('error')
      result.body.should.have.a.property('dishes')
    })
  
    it('should mark favorites in list', async () => {
      store.emit(models.getEvents().dishAdded({ id: '4711', name: 'Pancake' }))
      store.emit(models.getEvents().addDishToList('4711', '007'))
      const result = await request(app).get('/').set('Authorization', 'Bearer ' + validToken)
      result.body.dishes.should.deepEqual([
        { id: '4711', name: 'Pancake', items: [], isFavorite: true },
      ])
    })
  
    it('should not return information about favorites if not authenticated', async () => {
      store.emit(models.getEvents().dishAdded({ id: '4711', name: 'Pancake' }))
      store.emit(models.getEvents().addDishToList('4711', '42'))
      const result = await request(app).get('/')
      result.body.dishes.shift().should.not.have.property('isFavorite')
    })
  })

  describe('POST /dishes', () => {
    it('should not allow to create dishes when not authenticated', async () => {
      const result = await request(app)
        .post('/')
        .send({ name: 'Hamburger' })
      result.ok.should.be.false()
      result.status.should.equal(401)
      result.body.should.have.property('error')
    })

    it('should add a dish', async () => {
      const items = [{ amount: 1, unit: 'Stk', name: 'Bun' }, { amount: 1, unit: 'Stk', name: 'Patty' }]
      const result = await request(app)
        .post('/')
        .set('Authorization', 'Bearer ' + validToken)
        .send({ name: 'Hamburger', items })
      result.ok.should.be.true()
      result.body.id.should.not.be.empty()
      result.body.name.should.equal('Hamburger')
      const saved = models.dish.byId(result.body.id)
      saved.should.not.be.empty()
      saved.name.should.equal('Hamburger')
      saved.items.should.be.an.Array()
      saved.items.map(i => ({ ...models.ingredient.byId(i.id), amount: i.amount })).should.containDeep(items)
    })
  
    it(`should save the current user's listId as the owner of a new dish`, async () => {
      const result = await request(app)
        .post('/')
        .set('Authorization', 'Bearer ' + validToken)
        .send({ name: 'Hamburger' })
      const saved = models.dish.byId(result.body.id)
      saved.ownedBy.should.equal('007')
    })
  })

  describe('POST /dishes/:id/favorites', () => {
    it('should not allow to set favorites if not authenticated', async () => {
      const result = await request(app).post('/4711/favorites')
      result.ok.should.be.false()
    })
  
    it('should mark dishes as favorite for authenticated users', async () => {
      store.emit(models.getEvents().dishAdded({ id: '4711', name: 'Pancake' }))
      const result = await request(app).post('/4711/favorites').set('Authorization', 'Bearer ' + validToken)
      result.ok.should.be.true()
      models.dishList.getById('007').should.deepEqual(['4711'])
    })

    it('should return the dish when it was marked as favorite', async () => {
      store.emit(models.getEvents().dishAdded({ id: '4711', name: 'Pancake' }))
      const result = await request(app).post('/4711/favorites').set('Authorization', 'Bearer ' + validToken)
      result.body.should.have.a.property('isFavorite')
      result.body.isFavorite.should.be.true()
    })
  })

  describe('DELETE /dishes/:id/favorites', () => {
    it('should not allow to delete favorites if not authenticated', async () => {
      const result = await request(app).delete('/4711/favorites')
      result.ok.should.be.false()
    })

    it('should remove favorite mark from dish', async () => {
      store.emit(models.getEvents().dishAdded({ id: '4711', name: 'Pancake' }))
      store.emit(models.getEvents().addDishToList('4711', '007'))
      await request(app).delete('/4711/favorites').set('Authorization', 'Bearer ' + validToken)
      models.dishList.getById('007').should.deepEqual([])
    })
  
    it('should return the dish when the favorite mark was removed', async () => {
      store.emit(models.getEvents().dishAdded({ id: '4711', name: 'Pancake' }))
      store.emit(models.getEvents().addDishToList('4711', '006'))
      const result = await request(app).delete('/4711/favorites').set('Authorization', 'Bearer ' + validToken)
      result.ok.should.be.true()
      result.body.should.not.have.a.property('error')
      result.body.should.have.a.property('isFavorite')
      result.body.isFavorite.should.be.false()
    })
  })

  describe('PATCH /dishes/:id', () => {
    it('should update the title of a dish', async () => {
      store.emit(models.getEvents().dishAdded({ id: '4711', name: 'Pancake', ownedBy: '007' }))
      const result = await request(app)
        .patch('/4711')
        .set('Authorization', 'Bearer ' + validToken)
        .send({ name: 'Hamburger' })
      result.ok.should.be.true()
      result.body.id.should.equal('4711')
      result.body.name.should.equal('Hamburger')
      models.dish.byId(4711).name.should.equal('Hamburger')
    })

    it('should update the recipe of a dish', async () => {
      store.emit(models.getEvents().dishAdded({ id: '4711', name: 'Pancake', ownedBy: '007' }))
      const result = await request(app)
        .patch('/4711')
        .set('Authorization', 'Bearer ' + validToken)
        .send({ recipe: 'Place the patty in the bun' })
      result.ok.should.be.true()
      result.body.id.should.equal('4711')
      result.body.recipe.should.equal('Place the patty in the bun')
      models.dish.byId(4711).recipe.should.equal('Place the patty in the bun')
    })
    
    it('should ignore unknown properties of a dish', async () => {
    store.emit(models.getEvents().dishAdded({ id: '4711', name: 'Pancake', ownedBy: '007' }))
      const result = await request(app)
        .patch('/4711')
        .set('Authorization', 'Bearer ' + validToken)
        .send({ unknown: 'value' })
      result.ok.should.be.true()
      models.dish.byId(4711).should.containDeep({ id: '4711', name: 'Pancake' })
    })

    it('should not allow to update dishes if not authenticated', async () => {
      const result = await request(app)
        .patch('/4711')
        .send({ name: 'Hamburger' })
      result.ok.should.be.false()
      result.status.should.equal(401)
      result.body.should.have.property('error')
    })
  
    it('should not allow to update dishes if not owner', async () => {
      store.emit(models.getEvents().dishAdded({ id: '4711', name: 'Pancake', ownedBy: '0815' }))
      const result = await request(app)
        .patch('/4711')
        .set('Authorization', 'Bearer ' + validToken)
        .send({ name: 'Hamburger' })
      result.ok.should.be.false()
      result.status.should.equal(403)
      result.body.should.have.property('error')
    })
  
    it('should not allow to update dishes without owner', async () => {
      store.emit(models.getEvents().dishAdded({ id: '4711', name: 'Pancake' }))
      const result = await request(app)
        .patch('/4711')
        .set('Authorization', 'Bearer ' + validToken)
        .send({ name: 'Hamburger' })
      result.ok.should.be.false()
      result.status.should.equal(403)
      result.body.should.have.property('error')
    })
  
    it('should allow admins to update dishes without owner', async () => {
      store.emit(models.getEvents().dishAdded({ id: '4711', name: 'Pancake' }))
      const result = await request(app)
        .patch('/4711')
        .set('Authorization', 'Bearer ' + adminToken)
        .send({ name: 'Hamburger' })
      result.ok.should.be.true()
      result.body.name.should.equal('Hamburger')
      models.dish.byId(4711).name.should.equal('Hamburger')
    })
  })

  it('should add ingredients to a dish')
  
  it('should remove ingredients from a dish')
  
  it('should update the image of a dish')
})
