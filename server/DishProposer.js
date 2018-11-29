/*eslint-env node*/

function addIfNotAlreadyIn(array, element) {
  const existing = array.findIndex(el => el.id === element.id)
  if (existing !== -1) {
    if (array[existing].unit !== element.unit) {
      throw Error(`Problem: ingredient '${element.name}' is specified with different units!`)
    }
    array[existing].amount += element.amount
    return array
  } else {
    return [...array, element]
  }
}

class DishProposer {
  constructor({model}) {
    this.model = model
  }

  getActualIngredient(entry) {
    const id = entry.what
    const name = 'Unbekannte Zutat #' + id
    return Object.assign({id, amount: entry.amount, unit: entry.unit}, this.model.getIngredient(id) || {name})
  }

  get(options = {}) {
    const inhibited = options.inhibit || []
    const accepted = options.accepted || []
    const dishes = this.model.getDishes(7 + Math.max(0, inhibited.length))
      .filter(dish => !inhibited.some(id => +id === +dish.id))
    const ingredients = dishes
      .filter(dish => accepted.some(id => id === dish.id))
      .map(dish => dish.ingredients)                                // get ingredients for each accepted dish
      .reduce((acc, sub) => acc.concat(sub), [])                    // flatten list
      .map(entry => this.getActualIngredient(entry))
      .reduce(addIfNotAlreadyIn, [])

    return {dishes, ingredients}
  }
}

module.exports = DishProposer
