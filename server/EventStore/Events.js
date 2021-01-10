export default function ({ models }) {
  function assert(event, condition, message) {
    if (!condition) {
      const originalFunc = Error.prepareStackTrace
      const err = new Error()
      Error.prepareStackTrace = (err, stack) => stack.map(e => e.getFileName())
      const currentfile = err.stack.shift()
      const callerFile = err.stack
        .find(s => s !== currentfile)
        .split(/[\\/]/)
        .pop()
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

    dishModified(dishPartial) {
      assert(!!dishPartial, 'No dish')
      assert(dishPartial.id, 'No dish id')
      return { type: 'dishModified', ...dishPartial }
    },

    ingredientAdded(ingredient) {
      assert(!!ingredient, 'No ingredient')
      assert(ingredient.name, 'Missing name')
      return {
        type: 'ingredientAdded',
        id: ingredient.id,
        unit: ingredient.unit,
        name: ingredient.name,
        group: ingredient.group,
      }
    },

    ingredientAssigned(dishId, ingredientId, amount) {
      assert(dishId, 'No dishId')
      assert(ingredientId, 'No ingredientId')
      assert(models.dish.byId(dishId), 'Dish not found')
      assert(models.ingredient.byId(ingredientId), 'Ingredient not found')
      assert(amount > 0, 'No valid amount')
      return { type: 'ingredientAssigned', dishId, ingredientId, amount }
    },

    served(dishId, date, listId) {
      assert(dishId, 'No dishId')
      assert(date, 'No date')
      assert(listId, 'No listId')
      assert(models.dish.byId(dishId), 'Dish not found')
      assert(date instanceof Date, `date should be of type 'Date'`)
      return {
        type: 'served',
        dishId,
        listId,
        date: date.toISOString().replace(/T.*$/, ''),
      }
    },

    ingredientUpdated(ingredientId, name, value) {
      assert(ingredientId, 'No ingredientId')
      assert(name !== '', 'No attribute Name')
      assert(models.ingredient.byId(ingredientId), 'Ingredient not found')
      return { type: 'ingredientUpdated', ingredientId, name, value }
    },

    userAdded(user) {
      assert(user, 'No user')
      assert(user.id, 'No id')
      assert(user.email, 'No email')
      assert(user.email.match(/.+@.+\..+/), 'email has wrong format')
      return { type: 'userAdded', user }
    },

    userRemoved(id) {
      assert(id, 'No id')
      return { type: 'userRemoved', id }
    },

    userChanged(id, user) {
      assert(id, 'No id')
      assert(
        !user.email || user.email.match(/.+@.+\..+/),
        'email has wrong format'
      )
      return { type: 'userChanged', id, user }
    },

    invitationAccepted(user, listId) {
      assert(user, 'no user')
      assert(user.id, 'no user id')
      assert(listId, 'no list id')
      return { type: 'invitationAccepted', userId: user.id, listId }
    },

    addDishToList(dishId, listId) {
      assert(dishId, 'no dish id')
      assert(listId, 'no list id')
      assert(models.dishList.getById(listId), 'unkown dishList')
      return { type: 'addDishToList', dishId, listId }
    },

    removeDishFromList(dishId, listId) {
      assert(dishId, 'no dish id')
      assert(listId, 'no list id')
      assert(models.dishList.getById(listId), 'unkown dishList')
      return { type: 'removeDishFromList', dishId, listId }
    },
  }
}
