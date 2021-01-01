import express from 'express'

export default ({ controller, jsonResult, auth }) => {
  const router = express.Router()

  function getArrayParam(params, name) {
    return ((params[name] && params[name].split(',')) || [])
  }

  router.get('/:date', auth.requireJWT(), jsonResult(async req => controller.getWeekplan(req.user, req.params.date, getArrayParam(req.query, 'inhibit'))))

  return router
}
