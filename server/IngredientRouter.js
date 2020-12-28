import express from 'express'
import units from './models/units.js'

export default function ({ controller, jsonResult }) {
  const router = express.Router()

  router.get('/', jsonResult(controller.getIngredients))
  router.get('/units', jsonResult(() => units))
  router.put('/:id', jsonResult(req => controller.setIngredientGroup(req.params.id, req.body.group)))
  router.post('/', jsonResult(req => controller.addIngredient(req.body)))

  return router
}
