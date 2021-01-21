import { v4 as uuid } from "uuid"
import { Models } from "."
import { Store } from "../EventStore/EventStore"
import { ModelWriter } from "./ModelWriter"

type Item = { id: string, amount: number }

export type DishModel = {
  getAll(): Dish[]
  byId(id: string): Dish
  byName(name: string): Dish
  getStandardIngredients(): Item[]
  reset(): void
}

export type Dish = {
  id: string
  name: string
  source?: string
  alwaysOnList?: boolean
  items?: Item[]
  recipe?: string
  image?: string
  ownedBy?: string
  last?: Date
}

const dishes = {
  byId: {} as Record<string, Dish>,
  byName: {} as Record<string, Dish>,
}

export function addDish(writer: (dish: Dish) => void, data: Dish): void {
  const { id, name, source, alwaysOnList, items, recipe, image, ownedBy } = data
  const dish = { id, name, source, alwaysOnList, items, recipe, image, ownedBy }
  dish.id = dish.id || uuid()
  dish.items = dish.items || []
  dishes.byId[dish.id] = dish
  dishes.byName[dish.name.toLowerCase()] = dish
  writer(dish)
}

export function updateDish(writer: (dish: Dish) => void, dishPartial: Partial<Dish>): void {
  if (!dishPartial.id) {
    throw Error('No dish id specified')
  }
  const dish = dishes.byId[dishPartial.id]
  if (!dish) {
    throw Error(`Dish #${dishPartial.id} not found`)
  }
  const { name, recipe, source } = dishPartial
  const fields = { name, recipe, source }
  const changes = Object.entries(fields).filter(([name, value]) => dish[name as keyof Dish] !== value)
  if (changes) {
    Object.assign(dish, ...changes.map(([name, value]) => ({ [name]: value })))
    writer(dish)
  }
}

export function assignIngredient(writer: (dish: Dish) => void, { dishId, ingredientId, amount }: { dishId: string, ingredientId: string, amount: number }): void {
  const dish = dishes.byId[dishId]
  dish.items = dish.items || []
  dish.items.push({ id: '' + ingredientId, amount })
  writer(dish)
}

export function serve(writer: (dish: Dish) => void, { dishId, date }: { dishId: string, date: Date }): void {
  const dish = dishes.byId[dishId]
  dish.last = date
  writer(dish)
}

export function getAllDishes(): Dish[] {
  return Object.values(dishes.byId)
}

export function getDishById(id: string): Dish {
  return dishes.byId[id]
}

export function getDishByName(name: string): Dish {
  return dishes.byName[name]
}

export function getStandardIngredients(): Item[] {
  return Object.values(dishes.byId)
    .filter(dish => dish.alwaysOnList)
    .flatMap(dish => dish.items || [])
}

export default function ({ store, models, modelWriter }: { store: Store, models: Models, modelWriter: ModelWriter }): DishModel {
  const { dishAdded, dishModified, ingredientAssigned, served } = models.getEvents()
  store
    .on(dishAdded, (dish: Dish) => addDish(modelWriter.writeDish, dish))
    .on(dishModified, (dish: Dish) => updateDish(modelWriter.writeDish, dish))
    .on(ingredientAssigned, (item: { dishId: string, ingredientId: string, amount: number }) => assignIngredient(modelWriter.writeDish, item))
    .on(served, (dishId: string, date: Date) => serve(modelWriter.writeDish, { dishId, date }))

  return {
    getAll: getAllDishes,
    byId: getDishById,
    byName: getDishByName,
    getStandardIngredients,

    reset() {
      dishes.byId = {}
      dishes.byName = {}
    },
  }
}
