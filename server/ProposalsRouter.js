import express from 'express'

export default ({ proposer }) => {
  const router = express.Router()

  function getArrayParam(params, name) {
    return ((params[name] && params[name].split(',')) || [])
  }

  router.get('/', async (req, res) => res.json(await proposer.get(
    getArrayParam(req.query, 'inhibit')
  )))
  router.post('/fix', async (req, res) => res.json(await proposer.fix(req.body.accepted, new Date(req.body.date))))

  return router
}
