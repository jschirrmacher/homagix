import express from 'express'
import units from '../models/units.js'

export default function ({ controller, jsonResult }) {
  const router = express.Router()

  function getAvailableUnits() {
    return units
  }

  function setIngredientGroup(req) {
    return controller.setIngredientGroup(req.params.id, req.body.group)
  }

  function addIngredient(req) {
    return controller.addIngredient(req.body)
  }

  router.get('/', jsonResult(controller.getIngredients))
  router.get('/units', jsonResult(getAvailableUnits))
  router.put('/:id', jsonResult(setIngredientGroup))
  router.post('/', jsonResult(addIngredient))

  return router
}
