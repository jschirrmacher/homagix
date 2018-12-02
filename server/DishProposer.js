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
    const id = entry.ingredient
    const name = 'Unbekannte Zutat #' + id
    return Object.assign({id, amount: entry.amount, unit: entry.unit}, this.model.getIngredient(id) || {name})
  }

  get(inhibited = [], accepted = []) {
    const dishes = this.model.getDishes()
      .filter(dish => !inhibited.some(id => id === +dish.id))
      .sort((a, b) => new Date(a.last) - new Date(b.last))
      .slice(0, 7)
    const ingredients = dishes
      .filter(dish => accepted.some(id => id === dish.id))
      .map(dish => dish.ingredients)                                // get ingredients for each accepted dish
      .reduce((acc, sub) => acc.concat(sub), [])                    // flatten list
      .map(entry => this.getActualIngredient(entry))
      .reduce(addIfNotAlreadyIn, [])

    return {dishes, ingredients}
  }

  fix(accepted, date) {
    accepted.forEach(id => this.model.getDish(id).last = date)
    this.model.persistChanges()
    return {accepted, date}
  }
}

module.exports = DishProposer
