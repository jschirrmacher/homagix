import fs from 'fs'
import path from 'path'
import YAML from 'yaml'
import { v4 as uuid } from 'uuid'
import units from './models/units.js'

export default function ({ store, models }) {
  const { dishAdded, ingredientAdded, ingredientAssigned } = models.getEvents()

  function extractIngredientComponents(item) {
    const matches = item.match(/^\s*([\d.,]*)\s*(\w+)\.?\s*(.*)$/)
    const amount = +matches[1] || 1
    const hasUnit = units.map(u => u.name).includes(matches[2])
    const unit = hasUnit ? matches[2] : 'Stk'
    const name = hasUnit ? matches[3] : matches[2] + ' ' + matches[3]
    return { amount, unit, name }
  }

  function addItems(dishId, item) {
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

  function loadIngredients(basePath) {
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

  function loadDishes(basePath) {
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
      const items = dish.items
      delete dish.items
      store.dispatch(dishAdded(dish))
      if (items && items.map) {
        items.map(extractIngredientComponents).forEach(item => addItems(dish.id, item))
      }
    })
  }

  return {
    loadData(basePath) {
      loadIngredients(basePath)
      loadDishes(basePath)
    },
    addItems,
  }
}
