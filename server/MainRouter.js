import express from 'express'
import SessionRouter from './auth/SessionRouter.js'
import AccountRouter from './auth/AccountRouter.js'
import DishProposer from './Weekplan/DishProposer.js'
import DishesRouter from './DishesRouter.js'
import IngredientRouter from './IngredientRouter.js'
import IngredientController from './IngredientController.js'
import WeekplanController from './Weekplan/WeekplanController.js'
import WeekplanRouter from './Weekplan/WeekplanRouter.js'
import nodemailer from 'nodemailer'
import Mailer from './Mailer.js'

const mailer = Mailer({ nodemailer })

function jsonResult(func) {
  const fn = {
    async [func.name](req, res) {
      try {
        const result = await func(req)
        res.json(result)
      } catch (error) {
        console.error(error)
        res.status(500).json({ error })
      }
    }
  }
  return fn[func.name]
}

export default function ({ models, store, auth }) {
  const router = express.Router()
  const sessionRouter = SessionRouter({ auth })
  const accountRouter = AccountRouter({ auth, store, models, mailer })
  const proposer = DishProposer({ models })
  const dishesRouter = DishesRouter({ models, store, jsonResult, auth })
  const ingredientRouter = IngredientRouter({ controller: IngredientController({ models, store }), jsonResult })
  const weekplanRouter = WeekplanRouter({ controller: WeekplanController({ models, store, proposer }), jsonResult, auth })
  
  router.use('/sessions', sessionRouter)
  router.use('/accounts', accountRouter)
  router.use('/dishes', dishesRouter)
  router.use('/ingredients', ingredientRouter)
  router.use('/weekplan', weekplanRouter)

  return router
}
