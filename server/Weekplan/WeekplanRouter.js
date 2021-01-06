import express from 'express'

export default ({ controller, jsonResult, auth }) => {
  const router = express.Router()

  function getArrayParam(params, name) {
    return (params[name] && params[name].split(',')) || []
  }

  function getWeekplan(req) {
    return controller.getWeekplan(
      req.user,
      req.params.date,
      getArrayParam(req.query, 'inhibit')
    )
  }

  function fixPlan(req) {
    return controller.fixPlan(req.user, req.params.date, req.body.accepted)
  }

  router.use(auth.requireJWT())
  router.get('/:date', jsonResult(getWeekplan))
  router.post('/:date/fix', jsonResult(fixPlan))

  return router
}
