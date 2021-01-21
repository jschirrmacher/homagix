import { Models } from "../models"
import { User } from "../models/user"
import { Dish } from "../models/dish"
import { Ingredient } from "../models/ingredient"

export type Event = {
  type: string
}

export interface Events {
  dishAdded(dish: Dish): Event
  dishModified(dishPartial: Partial<Dish>): Event
  ingredientAdded(ingredient: Ingredient): Event
  ingredientAssigned(dishId: string, ingredientId: string, amount: number): Event
  served(dishId: string, date: Date, listId: string): Event
  ingredientUpdated(ingredientId: string, name: string, value: unknown): Event
  userAdded(user: User): Event
  userRemoved(id: string): Event
  userChanged(id: string, user: User): Event
  invitationAccepted(user: User, listId: string): Event
  addDishToList(dishId: string, listId: string): Event
  removeDishFromList(dishId: string, listId: string): Event
}

export default function ({ models }: { models: Models }): Events {
  function assert(condition: unknown, message: string) {
    if (!condition) {
      const obj = { stack: '' }
      Error.captureStackTrace(obj)
      const stack = obj.stack.split('\n').slice(1).map((line: string) => {
        const m = line.match(/^\s*at ([\w.<>]*)\s*\(?(.*?):(\d+):(\d+)\)?/) as string[]
        return { func: m[1], filename: m[2], lineNo: m[3], char: m[4] }
      })
      const type = stack[1].func
      const currentfile = stack[0].filename
      const firstForeignFile = stack.slice(1)
        .map(e => e.filename)
        .find(s => s !== currentfile)
      const callerFile = firstForeignFile && firstForeignFile
        .split(/[\\/]/)
        .pop()
      throw `Read model '${callerFile}', event '${type}': ${message}`
    }
  }

  return {
    dishAdded(dish) {
      assert(dish, 'No dish')
      assert(dish.name !== '', 'Missing name')
      return { type: 'dishAdded', ...dish }
    },

    dishModified(dishPartial) {
      assert(dishPartial, 'No dish')
      assert(dishPartial.id, 'No dish id')
      return { type: 'dishModified', ...dishPartial }
    },

    ingredientAdded(ingredient) {
      assert(ingredient, 'No ingredient')
      assert(ingredient.name, 'Missing name')
      return {
        type: 'ingredientAdded',
        id: ingredient.id,
        unit: ingredient.unit,
        name: ingredient.name,
        group: ingredient.group,
      }
    },

    ingredientAssigned(dishId: string, ingredientId: string, amount: number) {
      assert(dishId, 'No dishId')
      assert(ingredientId, 'No ingredientId')
      assert(models.dish.byId(dishId), 'Dish not found')
      assert(models.ingredient.byId(ingredientId), 'Ingredient not found')
      assert(amount > 0, 'No valid amount')
      return { type: 'ingredientAssigned', dishId, ingredientId, amount }
    },

    served(dishId: string, date: Date, listId: string) {
      assert(dishId, 'No dishId')
      assert(date, 'No date')
      assert(listId, 'No listId')
      assert(models.dish.byId(dishId), 'Dish not found')
      return {
        type: 'served',
        dishId,
        listId,
        date: date.toISOString().replace(/T.*$/, ''),
      }
    },

    ingredientUpdated(ingredientId: string, name: string, value: unknown) {
      assert(ingredientId, 'No ingredientId')
      assert(name !== '', 'No attribute Name')
      assert(models.ingredient.byId(ingredientId), 'Ingredient not found')
      return { type: 'ingredientUpdated', ingredientId, name, value }
    },

    userAdded(user: User) {
      assert(user, 'No user')
      assert(user.id, 'No id')
      assert(user.email, 'No email')
      assert(user.email.match(/.+@.+\..+/), 'email has wrong format')
      return { type: 'userAdded', user }
    },

    userRemoved(id: string) {
      assert(id, 'No id')
      return { type: 'userRemoved', id }
    },

    userChanged(id: string, user: User) {
      assert(id, 'No id')
      assert(
        !user.email || user.email.match(/.+@.+\..+/),
        'email has wrong format'
      )
      return { type: 'userChanged', id, user }
    },

    invitationAccepted(user: User, listId: string) {
      assert(user, 'no user')
      assert(user.id, 'no user id')
      assert(listId, 'no list id')
      return { type: 'invitationAccepted', userId: user.id, listId }
    },

    addDishToList(dishId: string, listId: string) {
      assert(dishId, 'no dish id')
      assert(listId, 'no list id')
      return { type: 'addDishToList', dishId, listId }
    },

    removeDishFromList(dishId: string, listId: string) {
      assert(dishId, 'no dish id')
      assert(listId, 'no list id')
      assert(models.dishList.getById(listId), 'unkown dishList')
      return { type: 'removeDishFromList', dishId, listId }
    },
  }
}
