import fs from 'fs'
import path from 'path'
import YAML from 'yaml'
import { getIngredientById } from './models/ingredient.js'

export default ({ basePath }) => {
  const dishesPath = path.join(basePath, 'dishes')
  const ingredientsPath = path.join(basePath, 'ingredients')
  fs.mkdirSync(dishesPath, { recursive: true })
  fs.mkdirSync(ingredientsPath, { recursive: true })

  return {
    writeDish(dish) {
      const data = Object.assign({}, dish, {
        items: dish.items && dish.items.map(ingredient => {
          const item = getIngredientById(ingredient.id)
          if (!item) {
            throw Error('Ingredient not found: ' + JSON.stringify(ingredient))
          }
          return `${ingredient.amount} ${item.unit} ${item.name}`
        })
      })
      delete data.id
      const yaml = '---\n' + YAML.stringify(data)
      fs.writeFileSync(path.join(dishesPath, dish.id + '.yaml'), yaml)
    },

    writeIngredient(ingredient) {
      fs.writeFileSync(path.join(ingredientsPath, ingredient.id + '.yaml'), '---\n' + YAML.stringify(ingredient))
    }
  }
}
