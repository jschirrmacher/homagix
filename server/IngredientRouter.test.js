import 'should'
import express from 'express'
import request from 'supertest'
import Router from './IngredientRouter.js'
import Models from './models/index.js'
import { store } from './Store.mock.js'
import Events from './Events.js'

const models = Models({ store })
const router = Router({ models, store })
const app = express()
app.use(router)

describe('IngredientRouter', () => {
  before(()=> {
    const { dishAdded, ingredientAdded, ingredientAssigned } = Events({ models })
    store.dispatch(dishAdded({ id: '_', name: 'default', alwaysOnList: true }))
    store.dispatch(ingredientAdded({ id: 1, name: 'Milch', unit: 'L' }))
    store.dispatch(ingredientAssigned('_', 1, 3))
  })

  it('should have a route to get all ingredients', async () => {
    const result = await request(app)
      .get('/')
      .expect('Content-Type', /json/)
      .expect(200)
    
    result.body.should.have.properties(['ingredients', 'standards'])
    result.body.ingredients.should.be.instanceof(Array)
    result.body.standards.should.be.instanceof(Array)
  })

  it('should return ingredients from the standards list', async () => {
    const result = await request(app).get('/')
    result.body.standards.should.deepEqual([{ id: 1, name: 'Milch', unit: 'L', amount: 3 }])
  })
})
