/*eslint-env node*/

class DishProposer {
  constructor({model}) {
    this.model = model
  }

  get(options = {}) {
    const inhibited = options.inhibit || []
    return this.model.getDishes(7 + Math.max(0, inhibited.length))
      .filter(dish => !inhibited.some(id => +id === +dish.id))
  }
}

module.exports = DishProposer
