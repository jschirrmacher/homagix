/*eslint-env node*/

const ModelStore = require('./ModelStore')

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

class Model {
  constructor() {
    const store = new ModelStore()
    const data = store.getData()
    this.knownUnits = {}
    this.ingredients = data.dishes
      .map(dish => dish.ingredients)                                // get ingredients for each dish
      .reduce((acc, sub) => acc.concat(sub), [])                    // flatten list
      .map(ingredient => ingredient.split(' ').slice(2).join(' '))  // cut away amount and unit
      .reduce((x, y) => x.includes(y) ? x : [...x, y], [])          // remove duplicates
      .map((name, index) => ({id: index + 1, name}))

    this.dishes = data.dishes.map(dish => {
      dish.ingredients = dish.ingredients.map(what => {
        let [amount, unit, ...nameComponents] = what.split(' ')
        amount = +amount.replace(',', '.')
        if (knownUnits.indexOf(unit) === -1) {
          throw `Unknown unit '${unit}'`
        }
        const name = nameComponents.join(' ')
        return {amount, unit, what: this.ingredients.find(which => which.name === name).id}
      })
      return dish
    })
  }

  getDishes(num) {
    return this.dishes.slice(0, num).sort((a, b) => new Date(a.last) - new Date(b.last))
  }

  getIngredient(id) {
    return this.ingredients.find(ingredient => ingredient.id === id)
  }
}

module.exports = Model
