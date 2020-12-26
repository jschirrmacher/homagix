import express from 'express'
import Events from './Events.js'
import SessionRouter from './auth/SessionRouter.js'
import DishProposer from './DishProposer.js'
import DishesRouter from './DishesRouter.js'
import IngredientRouter from './IngredientRouter.js'
import ProposalsRouter from './ProposalsRouter.js'
import IngredientController from './IngredientController.js'
import WeekplanController from './WeekplanController.js'
import WeekplanRouter from './WeekplanRouter.js'

function jsonResult(func) {
  return async (req, res) => {
    try {
      const result = await func(req)
      res.json(result)
    } catch (error) {
      console.error(error)
      res.status(500).json({ error })
    }
  }
}

export default function ({ models, store, auth }) {
  const router = express.Router()
  const events = Events({ models })
  const sessionRouter = SessionRouter({ auth })
  const proposer = DishProposer({ models, store, events })
  const dishesRouter = DishesRouter({ models, store })
  const ingredientRouter = IngredientRouter({ controller: IngredientController({ models, store }), jsonResult })
  const proposalsRouter = ProposalsRouter({ proposer })
  const weekplanRouter = WeekplanRouter({ controller: WeekplanController({ models, proposer }), jsonResult })
  
  router.use('/session', sessionRouter)
  router.use('/dishes', dishesRouter)
  router.use('/ingredients', ingredientRouter)
  router.use('/proposals', proposalsRouter)
  router.use('/weekplan', weekplanRouter)

  return router
}
