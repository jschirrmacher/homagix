import express from 'express'
import { v4 as uuid } from 'uuid'

export default function ({ models, store, auth, jsonResult, dishReader }) {
  const router = express.Router()
  const { addDishToList, removeDishFromList } = models.getEvents()

  function getAllDishes(req) {
    const favorites = req.user
      ? models.dishList.getById(req.user.listId || req.user.id) || []
      : []
    return {
      dishes: models.dish
        .getAll()
        .map(dish => ({ ...dish, isFavorite: favorites.includes(dish.id) })),
    }
  }

  function getSingleDish(user, dishId) {
    const favorites = user
      ? models.dishList.getById(user.listId || user.id)
      : []
    return {
      ...models.dish.byId(dishId),
      isFavorite: favorites.includes(dishId),
    }
  }

  async function addDish(req) {
    const id = uuid()
    await store.emit(models.getEvents().dishAdded({ id, name: req.body.name, recipe: req.body.recipe, source: req.body.source }))
    if (req.body.items && req.body.items.forEach) {
      req.body.items.forEach(item => dishReader.addItems(id, item))
    }
    return getSingleDish(req.user, id)
  }

  async function updateDish(req) {
    await store.emit(models.getEvents().dishModified({ id: req.params.id, ...req.body }))
    return getSingleDish(req.user, req.params.id)
  }

  async function setFavorite(user, dishId, isFavorite) {
    const event = isFavorite ? addDishToList : removeDishFromList
    await store.emit(event(dishId, user.listId || user.id))
    return getSingleDish(user, dishId)
  }

  function addFavorite(req) {
    return setFavorite(req.user, req.params.id, true)
  }

  function removeFavorite(req) {
    return setFavorite(req.user, req.params.id, false)
  }

  router.get(
    '/',
    auth.requireJWT({ allowAnonymous: true }),
    jsonResult(getAllDishes)
  )
  router.post('/', auth.requireJWT(), jsonResult(addDish))
  router.patch('/:id', auth.requireJWT(), jsonResult(updateDish))
  router.post('/:id/favorites', auth.requireJWT(), jsonResult(addFavorite))
  router.delete('/:id/favorites', auth.requireJWT(), jsonResult(removeFavorite))

  return router
}
