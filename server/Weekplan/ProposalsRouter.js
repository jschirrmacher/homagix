import express from 'express'

export default ({ proposer }) => {
  const router = express.Router()

  router.post('/fix', async (req, res) => res.json(await proposer.fix(req.body.accepted, new Date(req.body.date))))

  return router
}
