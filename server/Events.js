export default function ({ models }) {
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
      return { type: 'dishAdded', ...dish }
    },

    ingredientAdded(ingredient) {
      assert(!!ingredient, 'No ingredient')
      assert(ingredient.name, 'Missing name')
      return { type: 'ingredientAdded', id: ingredient.id, unit: ingredient.unit, name: ingredient.name }
    },

    ingredientAssigned(dishId, ingredientId, amount) {
      assert(dishId, 'No dishId')
      assert(ingredientId, 'No ingredientId')
      assert(models.dish.byId(dishId), 'Dish not found')
      assert(models.ingredient.byId(ingredientId), 'Ingredient not found')
      assert(amount > 0, 'No valid amount')
      return { type: 'ingredientAssigned', dishId, ingredientId, amount }
    },

    served(dishId, date) {
      assert(dishId, 'No dishId')
      assert(date, 'No date')
      assert(models.dish.byId(dishId), 'Dish not found')
      assert(date instanceof Date, `date should be of type 'Date'`)
      return { type: 'served', dishId, date: date.toISOString().replace(/T.*$/, '') }
    },

    ingredientUpdated(ingredientId, attrName, value) {
      assert(ingredientId, 'No ingredientId')
      assert(attrName !== '', 'No attrName')
      assert(models.ingredient.byId(ingredientId), 'Ingredient not found')
      return { type: 'ingredientUpdated', ingredientId, name, value }
    }
  }
}
