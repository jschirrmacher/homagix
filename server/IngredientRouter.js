const express = require('express')

module.exports = function ({model}) {
  const router = express.Router()

  router.get('/', async (req, res) => res.json(await model.getIngredients()))
  router.put('/:id', async (req, res) => {
    const item = await model.getIngredient(+req.params.id)
    item.group = req.body.group
    res.json(item)
    model.persistChanges()
  })

  return router
}
