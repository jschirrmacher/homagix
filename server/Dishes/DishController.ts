import { v4 as uuid } from 'uuid'
import { Store } from '../EventStore/EventStore'
import { Models } from '../models'
import { Dish } from '../models/dish'
import { User } from '../models/user'

export type DishController = {
  getAll(user?: User): Dish[]
  addDish(data: Dish, user: User): Promise<Dish>
  updateDish(id: string, dishPartial: Partial<Dish>, user: User): Promise<Dish>
  setFavorite(user: User, dishId: string, isFavorite: boolean): Promise<Dish>
  canEdit(user: User, dishId: string): boolean
}

type DishReader = {
  addItems(id: string, item: unknown): void
}

export default function ({
  store,
  models,
  dishReader,
}: {
  store: Store
  models: Models
  dishReader: DishReader
}): DishController {
  const {
    addDishToList,
    removeDishFromList,
    dishAdded,
    dishModified,
  } = models.getEvents()

  function getFavorites(user?: User) {
    return (user && models.dishList.getById(user.listId || user.id)) || []
  }

  function getSingleDish(dishId: string, user: User) {
    const favorites = getFavorites(user)
    return {
      ...models.dish.byId(dishId),
      isFavorite: favorites.includes(dishId),
    }
  }

  return {
    getAll(user?: User): Dish[] {
      const dishes = models.dish.getAll()
      if (user) {
        const favorites = getFavorites(user)
        return dishes.map(dish => ({
          ...dish,
          isFavorite: favorites.includes(dish.id),
        }))
      } else {
        return dishes
      }
    },

    async addDish(data: Dish, user: User): Promise<Dish> {
      const id = uuid()
      const dish = {
        id,
        name: data.name,
        recipe: data.recipe,
        source: data.source,
        ownedBy: user.listId || user.id,
        items: data.items,
      }
      await store.emit(dishAdded(dish))
      if (dish.items && dish.items.forEach) {
        dish.items.forEach(item => dishReader.addItems(id, item))
      }
      return dish
    },

    async updateDish(
      id: string,
      dishPartial: Partial<Dish>,
      user: User
    ): Promise<Dish> {
      await store.emit(dishModified({ ...dishPartial, id }))
      return getSingleDish(id, user)
    },

    async setFavorite(
      user: User,
      dishId: string,
      isFavorite: boolean
    ): Promise<Dish> {
      const event = isFavorite ? addDishToList : removeDishFromList
      await store.emit(event(dishId, user.listId || user.id))
      return getSingleDish(dishId, user)
    },

    canEdit(user: User, dishId: string): boolean {
      const dish = models.dish.byId(dishId)
      return dish && (user.isAdmin || [user.listId, user.id].includes(dish.ownedBy))
    },
  }
}
