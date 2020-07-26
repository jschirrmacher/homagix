module.exports = function ({ models }) {
  function assert(event, condition, message) {
    if (!condition) {
      const originalFunc = Error.prepareStackTrace
      const err = new Error()
      Error.prepareStackTrace = (err, stack) => stack.map(e => e.getFileName())
      const currentfile = err.stack.shift()
      const callerFile = err.stack.find(s => s !== currentfile).split(/[\\/]/).pop()
      Error.prepareStackTrace = originalFunc
      throw `Read model '${callerFile}', event '${event.type}': ${message}`
    }
  }

  return {
    dishAdded(dish) {
      assert(!!dish, 'No dish')
      assert(dish.name !== '', 'Missing name')
      return { type: 'dish-added', dish }
    },

    ingredientAdded(ingredient) {
      assert(!!ingredient, 'No ingredient')
      assert(ingredient.name, 'Missing name')
      return { type: 'ingredient-added', ingredient }
    },

    ingredientAssigned(dishId, ingredientId) {
      assert(dishId > 0, 'No dishId')
      assert(ingredientId > 0, 'No ingredientId')
      assert(models.dish.byId(dishId), 'Dish not found')
      assert(models.ingredient.byId(ingredientId), 'Ingredient not found')
      return { type: 'ingredient-assigned', dishId, ingredientId }
    },

    served(dishId, date) {
      assert(dishId > 0, 'No dishId')
      assert(date, 'No date')
      assert(models.dish.byId(dishId), 'Dish not found')
      assert(date instanceof Date, `date should be of type 'Date'`)
      return { type: 'served', dishId, date: date.toISOString().replace(/T.*$/, '') }
    },

    ingredientUpdated(ingredientId, attrName, value) {
      assert(ingredientId > 0, 'No ingredientId')
      assert(attrName !== '', 'No attrName')
      assert(models.ingredient.byId(ingredientId), 'Ingredient not found')
      return { type: 'ingredient-updated', ingredientId, name, value }
    }
  }
}
