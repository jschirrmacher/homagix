/*eslint-env node*/

const fs = require('fs')
const path = require('path')
const YAML = require('yaml')

const knownUnits = [
  'kg',
  'g',
  'Glas',
  'Stk.',
  'Zehen',
  'Pkg.',
  'L',
  'Bund',
  'Kopf',
  'Topf',
  'Würfel',
  'ml',
  'cm',
  'Dose'
]

const basePath = path.join(__dirname, '..', 'Homagix', 'Homagix.Server', 'Data')

class Model {
  constructor() {
    this.events = []
    this.viewModels = {
      dishes: [],
      ingredients: []
    }
    this.events = JSON.parse(fs.readFileSync(path.join(basePath, 'events.json')))
    this.replay()
  }

  replay() {
    this.events.forEach(event => {
      const type = event.type
      delete event.type
      switch (type) {
        case 'dish-added':
          this.viewModels.dishes.push(event)
          break

        case 'ingredient-added':
          this.viewModels.ingredients.push(event)
          break

        case 'served':
          this.viewModels.dishes.find(dish => dish.id === event.dish).last = new Date(event.date)
          break

        case 'ingredient-assigned': {
          const dish = this.viewModels.dishes.find(dish => dish.id === event.dish)
          delete event.dish
          dish.ingredients = dish.ingredients || []
          dish.ingredients.push(event)
          break
        }
      }
    })
  }

  getDishes(num) {
    return this.viewModels.dishes.slice(0, num).sort((a, b) => new Date(a.last) - new Date(b.last))
  }

  getIngredient(id) {
    return this.viewModels.ingredients.find(ingredient => ingredient.id === id)
  }
}

module.exports = Model
