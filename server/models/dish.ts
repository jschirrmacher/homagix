import { v4 as uuid } from 'uuid'
import { assert } from '../EventStore/Events'
import { Store, Event } from '../EventStore/EventStore'
import { ModelWriter } from './ModelWriter'

export type DishItem = {
  id: string
  amount: number
}

export interface DishEvents {
  dishAdded(dish: Dish): Event
  dishModified(dishPartial: Partial<Dish>): Event
  ingredientAssigned(
    dishId: string,
    ingredientId: string,
    amount: number
  ): Event
  itemRemoved(dishId: string, itemId: string): Event
  itemAmountUpdated(dishId: string, itemId: string, amount: number): Event
  served(dishId: string, date: Date, listId: string): Event
}

export interface DishModel {
  getAll(): Dish[]
  byId(id: string): Dish
  byName(name: string): Dish
  getStandardIngredients(): DishItem[]
  events: DishEvents
  mutators: Record<string, (event: Event) => void>
  reset(): void
}

export type Dish = {
  id: string
  name: string
  source?: string
  alwaysOnList?: boolean
  items: DishItem[]
  recipe?: string
  image?: string
  ownedBy?: string
  last?: Date
}

const dishes = {
  byId: {} as Record<string, Dish>,
  byName: {} as Record<string, Dish>,
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

export function getStandardIngredients(): DishItem[] {
  return Object.values(dishes.byId)
    .filter(dish => dish.alwaysOnList)
    .flatMap(dish => dish.items || [])
}

type DishWriter = (dish: Dish) => void

export function DishMutators(
  writer: DishWriter
): Record<string, (event: Event) => void> {
  return {
    addDish(event: Event): void {
      const fields = [
        'id',
        'name',
        'source',
        'alwaysOnList',
        'items',
        'recipe',
        'image',
        'ownedBy',
      ]
      const dish = Object.assign({}, ...fields.map(f => ({ [f]: event[f] })))
      dish.id = dish.id || uuid()
      dish.items = dish.items || []
      dishes.byId[dish.id] = dish
      dishes.byName[dish.name.toLowerCase()] = dish
      writer(dish)
    },

    updateDish(event: Event): void {
      if (!event.id) {
        throw Error('No dish id specified')
      }
      const dish = dishes.byId[event.id as string]
      if (!dish) {
        throw Error(`Dish #${event.id} not found`)
      }
      const { name, recipe, source } = event as Partial<Dish>
      const fields = { name, recipe, source }
      const changes = Object.entries(fields).filter(
        ([name, value]) => dish[name as keyof Dish] !== value
      )
      if (changes) {
        Object.assign(
          dish,
          ...changes.map(([name, value]) => ({ [name]: value }))
        )
        writer(dish)
      }
    },

    assignIngredient(event: Event): void {
      const { dishId, ingredientId, amount } = event as {
        dishId: string
        ingredientId: string
        amount: number
      }
      const dish = dishes.byId[dishId]
      assert(dish, 'Dish not found')
      dish.items = dish.items || []
      dish.items.push({ id: '' + ingredientId, amount })
      writer(dish)
    },

    removeItem(event: Event): void {
      const { dishId, itemId } = event as { dishId: string; itemId: string }
      const dish = dishes.byId[dishId]
      dish.items = dish.items.filter(item => item.id !== itemId)
      writer(dish)
    },

    updateItemAmount(event: Event): void {
      const { dishId, itemId, amount } = event as {
        dishId: string
        itemId: string
        amount: number
      }
      const dish = dishes.byId[dishId]
      dish.items = dish.items.map(item =>
        item.id === itemId ? { ...item, amount } : item
      )
      writer(dish)
    },

    serve(event: Event): void {
      const { dishId, date } = event as { dishId: string; date: Date }
      const dish = dishes.byId[dishId]
      assert(dish, 'Dish not found')
      dish.last = date
      writer(dish)
    },
  }
}

export const events: DishEvents = {
  dishAdded(dish: Dish) {
    assert(dish, 'No dish')
    assert(dish.name !== '', 'Missing name')
    return { type: 'dishAdded', ...dish }
  },

  dishModified(dishPartial: Partial<Dish>) {
    assert(dishPartial, 'No dish')
    assert(dishPartial.id, 'No dish id')
    return { type: 'dishModified', ...dishPartial }
  },

  ingredientAssigned(dishId: string, ingredientId: string, amount: number) {
    assert(dishId, 'No dishId')
    assert(ingredientId, 'No ingredientId')
    assert(amount > 0, 'No valid amount')
    return { type: 'ingredientAssigned', dishId, ingredientId, amount }
  },

  itemRemoved(dishId: string, itemId: string) {
    assert(dishId, 'No dishId')
    assert(itemId, 'No itemId')
    return { type: 'itemRemoved', dishId, itemId }
  },

  itemAmountUpdated(
    dishId: string,
    itemId: string,
    amount: number
  ): Event {
    assert(dishId, 'No dishId')
    assert(itemId, 'No itemId')
    assert(amount > 0, 'Amount should be greater than zero')
    return { type: 'itemAmountUpdated', dishId, itemId, amount }
  },

  served(dishId: string, date: Date, listId: string) {
    assert(dishId, 'No dishId')
    assert(date, 'No date')
    assert(listId, 'No listId')
    return {
      type: 'served',
      dishId,
      listId,
      date: date.toISOString().replace(/T.*$/, ''),
    }
  },
}

export default function ({
  store,
  modelWriter,
}: {
  store: Store
  modelWriter: ModelWriter
}): DishModel {
  const mutators = DishMutators(modelWriter.writeDish)

  store
    .on(events.dishAdded, mutators.addDish)
    .on(events.dishModified, mutators.updateDish)
    .on(events.ingredientAssigned, mutators.assignIngredient)
    .on(events.itemAmountUpdated, mutators.updateItemAmount)
    .on(events.itemRemoved, mutators.removeItem)
    .on(events.served, mutators.serve)

  return {
    getAll: getAllDishes,
    byId: getDishById,
    byName: getDishByName,
    getStandardIngredients,

    events,
    mutators,

    reset() {
      dishes.byId = {}
      dishes.byName = {}
    },
  }
}
