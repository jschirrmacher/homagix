import { v4 as uuid } from "uuid"
import { Models } from "."
import { Store, Event } from "../EventStore/EventStore"
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

type DishWriter = (dish: Dish) => void

const dishes = {
  byId: {} as Record<string, Dish>,
  byName: {} as Record<string, Dish>,
}

export function addDish(writer: DishWriter, event: Event): void {
  const { id, name, source, alwaysOnList, items, recipe, image, ownedBy } = event
  const dish = { id, name, source, alwaysOnList, items, recipe, image, ownedBy } as Dish
  dish.id = dish.id || uuid()
  dish.items = dish.items || []
  dishes.byId[dish.id] = dish
  dishes.byName[dish.name.toLowerCase()] = dish
  writer(dish)
}

export function updateDish(writer: DishWriter, event: Event): void {
  if (!event.id) {
    throw Error('No dish id specified')
  }
  const dish = dishes.byId[event.id as string]
  if (!dish) {
    throw Error(`Dish #${event.id} not found`)
  }
  const { name, recipe, source } = event as Partial<Dish>
  const fields = { name, recipe, source }
  const changes = Object.entries(fields).filter(([name, value]) => dish[name as keyof Dish] !== value)
  if (changes) {
    Object.assign(dish, ...changes.map(([name, value]) => ({ [name]: value })))
    writer(dish)
  }
}

export function assignIngredient(writer: DishWriter, event: Event): void {
  const { dishId, ingredientId, amount } = event as { dishId: string, ingredientId: string, amount: number }
  const dish = dishes.byId[dishId]
  dish.items = dish.items || []
  dish.items.push({ id: '' + ingredientId, amount })
  writer(dish)
}

export function serve(writer: DishWriter, event: Event): void {
  const { dishId, date } = event as { dishId: string, date: Date }
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
    .on(dishAdded, (event: Event) => addDish(modelWriter.writeDish, event))
    .on(dishModified, (event: Event) => updateDish(modelWriter.writeDish, event))
    .on(ingredientAssigned, (event: Event) => assignIngredient(modelWriter.writeDish, event))
    .on(served, (event: Event) => serve(modelWriter.writeDish, event))

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
