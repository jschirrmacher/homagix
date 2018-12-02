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
    const pathToStorage = path.join(basePath, 'speisen.yaml')
    if (fs.existsSync(pathToStorage)) {
      this.migrateData(YAML.parse(fs.readFileSync(pathToStorage).toString()))
      fs.unlinkSync(pathToStorage)
    } else {
      this.events = JSON.parse(fs.readFileSync(path.join(basePath, 'events.json')))
    }
    this.replay()
  }

  migrateData(data) {
    const ingredients = []
    let id = 0
    data.dishes.forEach(dish => {
      this.events.push({type: 'dish-added', id: dish.id, name: dish.name, source: dish.source})
      if (dish.last) {
        this.events.push({type: 'served', dish: dish.id, date: dish.last})
      }
      dish.ingredients.forEach(ingredient => {
        let [amount, unit, ...nameComponents] = ingredient.split(' ')
        amount = +amount.replace(',', '.')
        if (knownUnits.indexOf(unit) === -1) {
          throw `Unknown unit '${unit}'`
        }
        const name = nameComponents.join(' ')
        let existing = ingredients.find(which => which.name === name)
        if (!existing) {
          existing = {type: 'ingredient-added', id: ++id, name}
          this.events.push(existing)
          ingredients.push({id, name})
        }
        this.events.push({type: 'ingredient-assigned', dish: dish.id, ingredient: existing.id, amount, unit})
      })
    })
    fs.writeFileSync(path.join(basePath, 'events.json'), JSON.stringify(this.events, null, 2))
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
