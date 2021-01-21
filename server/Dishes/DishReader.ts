import fs from 'fs'
import path from 'path'
import YAML from 'yaml'
import { v4 as uuid } from 'uuid'
import units from '../models/units'
import { Store } from '../EventStore/EventStore'
import { Models } from '../models'
import { Ingredient } from '../models/ingredient'

export default function ({ store, models }: { store: Store, models: Models }) {
  const { dishAdded, ingredientAdded, ingredientAssigned } = models.getEvents()

  function extractIngredientComponents(itemString: string): Ingredient {
    const matches = itemString.match(/^\s*([\d.,]*)\s*(\w+)\.?\s*(.*)$/)
    const amount = (matches ? +matches[1] : 1) || 1
    const hasUnit = matches && units.map(u => u.name).includes(matches[2])
    const unit = hasUnit && matches ? matches[2] : 'Stk'
    const name = hasUnit && matches ? matches[3] : (matches && matches[2] + ' ' + matches[3]) || ''
    return { amount, unit, name }
  }

  function addItems(dishId: string, item: Ingredient) {
    const existing = models.ingredient.byExample(item, true)
    if (existing) {
      store.dispatch(
        ingredientAssigned(dishId, existing.id, item.amount)
      )
    } else {
      item.id = uuid()
      store.dispatch(ingredientAdded(item))
      store.dispatch(ingredientAssigned(dishId, item.id, item.amount))
    }
  }

  function loadIngredients(basePath: string) {
    const dir = path.resolve(basePath, 'ingredients')
    if (!fs.existsSync(dir)) {
      return
    }
    fs.readdirSync(dir).map(file => {
      const content = fs
        .readFileSync(path.resolve(basePath, 'ingredients', file))
        .toString()
      const ingredient = YAML.parse(content)
      ingredient.id = file.replace(/\.\w+$/, '')
      store.dispatch(ingredientAdded(ingredient))
    })
  }

  function loadDishes(basePath: string) {
    const dir = path.resolve(basePath, 'dishes')
    if (!fs.existsSync(dir)) {
      return
    }
    fs.readdirSync(dir).map(file => {
      const content = fs
        .readFileSync(path.resolve(basePath, 'dishes', file))
        .toString()
      const dish = YAML.parse(content)
      dish.id = file.replace(/\.\w+$/, '')
      const items = dish.items as string[]
      delete dish.items
      store.dispatch(dishAdded(dish))
      if (items && items.map) {
        items.map(extractIngredientComponents).forEach(item => addItems(dish.id, item))
      }
    })
  }

  return {
    loadData(basePath: string) {
      loadIngredients(basePath)
      loadDishes(basePath)
    },
    addItems,
  }
}
