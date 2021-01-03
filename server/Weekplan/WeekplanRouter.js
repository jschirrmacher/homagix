import express from 'express'

export default ({ controller, jsonResult, auth }) => {
  const router = express.Router()

  function getArrayParam(params, name) {
    return ((params[name] && params[name].split(',')) || [])
  }

  router.use(auth.requireJWT())
  router.get('/:date', jsonResult(async req => controller.getWeekplan(req.user, req.params.date, getArrayParam(req.query, 'inhibit'))))
  router.post('/:date/fix', jsonResult(async (req) => controller.fixPlan(req.user, req.params.date, req.body.accepted)))

  return router
}
