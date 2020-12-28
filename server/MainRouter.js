import express from 'express'
import Events from './EventStore/Events.js'
import SessionRouter from './auth/SessionRouter.js'
import AccountRouter from './auth/AccountRouter.js'
import DishProposer from './Weekplan/DishProposer.js'
import DishesRouter from './DishesRouter.js'
import IngredientRouter from './IngredientRouter.js'
import ProposalsRouter from './Weekplan/ProposalsRouter.js'
import IngredientController from './IngredientController.js'
import WeekplanController from './Weekplan/WeekplanController.js'
import WeekplanRouter from './Weekplan/WeekplanRouter.js'

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
  const accountRouter = AccountRouter({ auth, store, models })
  const proposer = DishProposer({ models, store, events })
  const dishesRouter = DishesRouter({ models, store })
  const ingredientRouter = IngredientRouter({ controller: IngredientController({ models, store }), jsonResult })
  const proposalsRouter = ProposalsRouter({ proposer })
  const weekplanRouter = WeekplanRouter({ controller: WeekplanController({ models, proposer }), jsonResult })
  
  router.use('/sessions', sessionRouter)
  router.use('/accounts', accountRouter)
  router.use('/dishes', dishesRouter)
  router.use('/ingredients', ingredientRouter)
  router.use('/proposals', proposalsRouter)
  router.use('/weekplan', weekplanRouter)

  return router
}
