import should from 'should'
import express, { Request, Response } from 'express'
import request from 'supertest'
import bodyParser from 'body-parser'
import Router from './IngredientRouter'
import Controller from './IngredientController'
import Store from '../EventStore/Store.mock'
import Models from '../models/MockedModel'

const store = Store()
const models = Models({ store })
const jsonResult = (func: (req: Request) => void) => async (req: Request, res: Response) => res.json(await func(req))
const controller = Controller({ models, store })
const router = Router({ controller, jsonResult })
const app = express()
app.use(bodyParser.json())
app.use(router)

describe('IngredientRouter', () => {
  before(() => {
    const {
      dishAdded,
      ingredientAdded,
      ingredientAssigned,
    } = models.getEvents()
    models.dish.reset()
    store.dispatch(dishAdded({ id: '_', name: 'default', alwaysOnList: true }))
    store.dispatch(
      ingredientAdded({ id: '1', name: 'Milch', unit: 'L', group: 'cooled' })
    )
    store.dispatch(ingredientAssigned('_', '1', 3))
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
    result.body.standards.should.deepEqual([
      { id: '1', name: 'Milch', unit: 'L', amount: 3, group: 'cooled' },
    ])
  })

  it('should add new ingredients', async () => {
    const name = 'new ingredient ' + +new Date()
    await request(app).post('/').send({ name, unit: 'g' })
    should(models.ingredient.byName(name)).not.be.undefined()
  })

  it('should create a uuid when adding new ingredients', async () => {
    const result = await request(app)
      .post('/')
      .send({ name: 'new ingredient', unit: 'g' })
    result.body.id.should.match(/^[0-9a-f-]+$/)
  })

  it('should use group "other" for new ingredients', async () => {
    const result = await request(app)
      .post('/')
      .send({ name: 'new ingredient ' + +new Date(), amount: 100, unit: 'g' })
    result.body.group.should.equal('other')
  })
})
