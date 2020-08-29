import fs from 'fs'
import path from 'path'
import YAML from 'yaml'
import { v4 as uuid } from 'uuid'
import Events from './Events.js'
import units from './units.js'

export default function ({ store, models, basePath }) {
  const { dishAdded, ingredientAdded, ingredientAssigned } = Events({ models })

  function extractIngredientComponents(item) {
    const matches = item.match(/^\s*([\d.,]*)\s*(\w+)\.?\s*(.*)$/)
    const amount = +matches[1] || 1
    const hasUnit = units.includes(matches[2])
    const unit = hasUnit ? matches[2] : 'Stk'
    const name = hasUnit ? matches[3] : (matches[2] + ' ' + matches[3])
    return { amount, unit, name }
  }

  return {
    loadData() {
      fs.readdirSync(path.resolve(basePath, 'dishes')).map(file => {
        const content = fs.readFileSync(path.resolve(basePath, 'dishes', file)).toString()
        const dish = YAML.parse(content)
        dish.id = file.replace(/\.\w+$/, '')
        const items = dish.items
        delete dish.items
        store.dispatch(dishAdded(dish))
        items.map(extractIngredientComponents).forEach(item => {
          const existing = models.ingredient.byExample(item)
          if (!existing) {
            item.id = uuid()
            store.dispatch(ingredientAdded(item))
          }
          store.dispatch(ingredientAssigned(dish.id, item.id))
        })
      })
    }
  }
}
