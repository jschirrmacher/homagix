/*eslint-env node*/

const fs = require('fs')
const path = require('path')

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
    this.transactionIsOpen = false
  }

  replay() {
    this.inReplay = true
    this.events.forEach(event => this.handleEvent(event))
    this.inReplay = false
  }

  handleEvent(event) {
    const makeListener = type => {
      return {
        set: (obj, name, value) => {
          obj[name] = value
          if (!this.inReplay) {
            const event = {type: type + '-updated', id: obj.id, name, value}
            this.events.push(event)
            this.transactionIsOpen = true
          }
          return true
        }
      }
    }
    const type = event.type
    const data = Object.assign({}, event)
    delete data.type
    switch (type) {
      case 'dish-added':
        this.viewModels.dishes.push(new Proxy(data, makeListener('dishes')))
        break

      case 'ingredient-added':
        this.viewModels.ingredients.push(data)
        break

      case 'served':
        this.viewModels.dishes.find(dish => dish.id === data.dish).last = new Date(data.date)
        break

      case 'ingredient-assigned': {
        const dish = this.viewModels.dishes.find(dish => dish.id === data.dish)
        delete data.dish
        dish.ingredients = dish.ingredients || []
        dish.ingredients.push(data)
        break
      }

      case 'dish-updated':
        this.viewModels.dishes.find(dish => dish.id === data.id)[data.name] = data.value
        break
    }
  }

  persistChanges() {
    if (this.transactionIsOpen) {
      fs.writeFileSync(path.join(basePath, 'events.json'), JSON.stringify(this.events, null, 2))
      this.transactionIsOpen = false
    }
  }

  getDishes() {
    return this.viewModels.dishes
  }

  getDish(id) {
    return this.viewModels.dishes.find(dish => dish.id === id)
  }

  getIngredients() {
    return this.viewModels.ingredients
  }

  getIngredient(id) {
    return this.viewModels.ingredients.find(ingredient => ingredient.id === id)
  }
}

module.exports = Model
