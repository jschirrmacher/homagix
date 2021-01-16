import { v4 as uuid } from 'uuid'

export default function ({ store, models, dishReader }) {
  const { addDishToList, removeDishFromList, dishAdded, dishModified } = models.getEvents()

  function getFavorites(user) {
    return (user && models.dishList.getById(user.listId || user.id)) || []
  }

  function getSingleDish(dishId, user) {
    const favorites = getFavorites(user)
    return {
      ...models.dish.byId(dishId),
      isFavorite: favorites.includes(dishId),
    }
  }

  return {
    getAll(user) {
      const dishes = models.dish.getAll()
      if (user) {
        const favorites = getFavorites(user)
        return dishes.map(dish => ({ ...dish, isFavorite: favorites.includes(dish.id) }))
      } else {
        return dishes
      }
    },

    async addDish(data, user) {
      const id = uuid()
      const dish = { id, name: data.name, recipe: data.recipe, source: data.source, ownedBy: user.listId || user.id, items: data.items }
      await store.emit(dishAdded(dish))
      if (dish.items && dish.items.forEach) {
        dish.items.forEach(item => dishReader.addItems(id, item))
      }
      return dish
    },

    async updateDish(id, dishPartial, user) {
      await store.emit(dishModified({ ...dishPartial, id }))
      return getSingleDish(id, user)
    },

    async setFavorite(user, dishId, isFavorite) {
      const event = isFavorite ? addDishToList : removeDishFromList
      await store.emit(event(dishId, user.listId || user.id))
      return getSingleDish(dishId, user)
    },

    isOwner(user, dishId) {
      const dish = models.dish.byId(dishId)
      return dish && [user.listId, user.id].includes(dish.ownedBy)
    },
  }
}
