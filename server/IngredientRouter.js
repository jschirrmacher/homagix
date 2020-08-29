import express from 'express'
import units from './units.js'
import Events from './Events.js'

export default function ({ models, store }) {
  const router = express.Router()
  const { ingredientUpdated } = Events({ models })

  router.get('/', async (req, res) => res.json({ ingredients: await models.ingredient.getAll() }))
  router.get('/units', (req, res) => res.json(units))
  router.put('/:id', async (req, res) => {
    await store.emit(ingredientUpdated(+req.params.id, 'group', req.body.group))
    res.json(models.ingredients.byId(+req.params.id))
  })

  return router
}
