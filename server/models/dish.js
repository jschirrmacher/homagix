export default function ({ store, events }) {
  const { dishAdded, ingredientAssigned, served } = events

  const dishes = {
    byId: {},
    byName: {},
  }

  store
    .on(dishAdded, ({ id, name, source }) => {
      const dish = { id, name, source }
      dishes.byId[id] = dish
      dishes.byName[name.toLowerCase()] = dish
    })
    .on(ingredientAssigned, ({ dishId, ingredientId, amount, unit }) => {
      const dish = dishes.byId[dishId]
      dish.ingredients = dish.ingredients || []
      dish.ingredients.push({ id: ingredientId, amount, unit })
    })
    .on(served, ({ dishId, date }) => {
      const dish = dishes.byId[dishId]
      dish.last = date
    })

  return {
    getAll() {
      return Object.values(dishes.byId)
    },

    byId(id) {
      return dishes.byId[id]
    },

    byName(name) {
      return dishes.byName[name]
    }
  }
}
