import express from 'express'

export default function ({ models }) {
  const router = express.Router()

  router.get('/', (req, res) => res.json({ dishes: models.dish.getAll() }))

  return router
}
