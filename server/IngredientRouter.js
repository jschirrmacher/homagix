const express = require('express')

module.exports = function ({ models, store }) {
  const router = express.Router()
  const { ingredientUpdated } = require('./events')({ models })

  router.get('/', async (req, res) => res.json(await models.ingredient.getAll()))
  router.put('/:id', async (req, res) => {
    await store.emit(ingredientUpdated(+req.params.id, 'group', req.body.group))
    res.json(models.ingredients.byId(+req.params.id))
  })

  return router
}
