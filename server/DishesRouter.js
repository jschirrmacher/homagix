import express from 'express'

export default function ({ models, store, auth, jsonResult }) {
  const router = express.Router()
  const { addDishToList, removeDishFromList } = models.getEvents()

  function getAllDishes(req) {
    const favorites = req.user ? (models.dishList.getById(req.user.listId || req.user.id) || []) : []
    return { dishes: models.dish.getAll().map(dish => ({ ...dish, isFavorite: favorites.includes(dish.id) })) }
  }

  async function setFavorite(user, dishId, isFavorite) {
    const event = isFavorite ? addDishToList : removeDishFromList
    await store.emit(event(dishId, user.listId || user.id))
    const favorites = user ? models.dishList.getById(user.listId || user.id) : []
    return { ...models.dish.byId(dishId), isFavorite: favorites.includes(dishId) }
  }

  function addFavorite(req) {
    return setFavorite(req.user, req.params.id, true)
  }

  function removeFavorite(req) {
    return setFavorite(req.user, req.params.id, false)
  }

  router.get('/', auth.requireJWT({ allowAnonymous: true }), jsonResult(getAllDishes))
  router.post('/:id/favorites', auth.requireJWT(), jsonResult(addFavorite))
  router.delete('/:id/favorites', auth.requireJWT(), jsonResult(removeFavorite))

  return router
}
