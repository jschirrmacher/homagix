const express = require('express')

module.exports = function ({model, proposer}) {
  const router = express.Router()

  function getIntArrayParam(params, name) {
    return ((params[name] && params[name].split(',')) || []).map(n => parseInt(n))
  }

  router.get('/', async (req, res) => res.json(await proposer.get(
    getIntArrayParam(req.query, 'inhibit'),
    getIntArrayParam(req.query, 'accepted')
  )))
  router.post('/fix', async (req, res) => res.json(await proposer.fix(req.body.accepted, new Date(req.body.date))))

  return router
}
