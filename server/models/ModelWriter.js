import fs from 'fs'
import path from 'path'
import YAML from 'yaml'
import { getIngredientById } from './ingredient.js'

export default ({ basePath }) => {
  function writer(name) {
    const base = path.join(basePath, name)
    fs.mkdirSync(base, { recursive: true })
    return (id, data) => {
      const filePath = path.join(base, id + '.yaml')
      if (data) {
        fs.writeFileSync(filePath, '---\n' + YAML.stringify(data))
      } else {
        fs.unlinkSync(filePath)
      }
    }
  }

  const dishesWriter = writer('dishes')
  const ingredientsWriter = writer('ingredients')
  const usersWriter = writer('users')

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
      dishesWriter(dish.id, data)
    },

    writeIngredient(ingredient) {
      ingredientsWriter(ingredient.id, ingredient)
    },

    writeUser(user) {
      usersWriter(user.id, user)
    },

    removeUser(id) {
      usersWriter(id, null)
    }
  }
}
