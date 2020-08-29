import express from 'express'
import Events from './Events.js'
import DishProposer from './DishProposer.js'
import DishesRouter from './DishesRouter.js'
import IngredientRouter from './IngredientRouter.js'
import ProposalsRouter from './ProposalsRouter.js'

export default function ({ models, store }) {
  const router = express.Router()
  const events = Events({ models })
  const proposer = DishProposer({ models, store, events })
  const dishesRouter = DishesRouter({ models, store })
  const ingredientRouter = IngredientRouter({ models, store })
  const proposalsRouter = ProposalsRouter({ proposer })
  
  router.use('/dishes', dishesRouter)
  router.use('/ingredients', ingredientRouter)
  router.use('/proposals', proposalsRouter)

  return router
}
