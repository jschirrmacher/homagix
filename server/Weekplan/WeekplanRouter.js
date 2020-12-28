import express from 'express'

export default ({ controller, jsonResult }) => {
  const router = express.Router()

  function getArrayParam(params, name) {
    return ((params[name] && params[name].split(',')) || [])
  }

  router.get('/:date', jsonResult(async req => controller.getWeekplan(req.params.date, getArrayParam(req.query, 'inhibit'))))

  return router
}
