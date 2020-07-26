const { Transform } = require('stream')

module.exports = class mig1 extends Transform {
  constructor(options = {}) {
    options.objectMode = true
    super(options)
  }

  _transform(event, encoding, callback) {
    event.type = event.type.replace(/-(.)/g, (m, p) => p.toUpperCase())

    if ((event.type === 'served' || event.type === 'ingredientAssigned') && event.dish) {
      event.dishId = event.dish
      delete event.dish
    }

    if (event.type === 'ingredientAssigned' && event.ingredient) {
      event.ingredientId = event.ingredient
      delete event.ingredient
    }

    if (event.type === 'ingredientUpdated' && event.id) {
      event.ingredientId = event.id
      delete event.id
    }

    this.push(event)
    callback()
  }
}
