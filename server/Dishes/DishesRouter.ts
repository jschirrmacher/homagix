import express, { NextFunction, Request, Response, Router } from 'express'
import { MiddleWare } from '../auth/auth'
import { User } from '../models/user'
import { DishController } from './DishController'
import { JSONHandler } from '../MainRouter'

type Auth = { checkJWT: MiddleWare; requireJWT: MiddleWare }

export default function ({
  auth,
  jsonResult,
  dishController,
}: {
  auth: Auth
  jsonResult: JSONHandler
  dishController: DishController
}): Router {
  const router = express.Router()
  const { checkJWT, requireJWT } = auth
  const assertOwner = () => (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (dishController.isOwner(req.user as User, req.params.id)) {
      next()
    } else {
      res.status(403).json({ error: 'Not allowed to update a foreign dish' })
    }
  }

  function getAllDishes(req: Request) {
    return { dishes: dishController.getAll(req.user as User) }
  }

  function addDish(req: Request) {
    return dishController.addDish(req.body, req.user as User)
  }

  function updateDish(req: Request) {
    return dishController.updateDish(req.params.id, req.body, req.user as User)
  }

  function addFavorite(req: Request) {
    return dishController.setFavorite(req.user as User, req.params.id, true)
  }

  function removeFavorite(req: Request) {
    return dishController.setFavorite(req.user as User, req.params.id, false)
  }

  router.get('/', checkJWT(), jsonResult(getAllDishes))
  router.post('/', requireJWT(), jsonResult(addDish))
  router.patch('/:id', requireJWT(), assertOwner(), jsonResult(updateDish))
  router.post('/:id/favorites', requireJWT(), jsonResult(addFavorite))
  router.delete('/:id/favorites', requireJWT(), jsonResult(removeFavorite))

  return router
}
