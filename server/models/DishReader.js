import fs from 'fs'
import path from 'path'
import YAML from 'yaml'
import { v4 as uuid } from 'uuid'
import units from './units.js'

export default function ({ store, models, basePath }) {
  const { dishAdded, ingredientAdded, ingredientAssigned } = models.getEvents()

  function extractIngredientComponents(item) {
    const matches = item.match(/^\s*([\d.,]*)\s*(\w+)\.?\s*(.*)$/)
    const amount = +matches[1] || 1
    const hasUnit = units.map(u => u.name).includes(matches[2])
    const unit = hasUnit ? matches[2] : 'Stk'
    const name = hasUnit ? matches[3] : matches[2] + ' ' + matches[3]
    return { amount, unit, name }
  }

  function loadIngredients() {
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

  function loadDishes() {
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
      items &&
        items.map(extractIngredientComponents).forEach(item => {
          const existing = models.ingredient.byExample(item, true)
          if (existing) {
            store.dispatch(
              ingredientAssigned(dish.id, existing.id, item.amount)
            )
          } else {
            item.id = uuid()
            store.dispatch(ingredientAdded(item))
            store.dispatch(ingredientAssigned(dish.id, item.id, item.amount))
          }
        })
    })
  }

  return {
    loadData() {
      loadIngredients()
      loadDishes()
    },
  }
}
