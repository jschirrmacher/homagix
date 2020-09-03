export default function ({ store, events }) {
  const { dishAdded, ingredientAssigned, served } = events

  const dishes = {
    byId: {},
    byName: {},
  }

  store
    .on(dishAdded, ({ id, name, source, alwaysOnList }) => {
      const dish = { id, name, source, alwaysOnList }
      dishes.byId[id] = dish
      dishes.byName[name.toLowerCase()] = dish
    })
    .on(ingredientAssigned, ({ dishId, ingredientId, amount }) => {
      const dish = dishes.byId[dishId]
      dish.ingredients = dish.ingredients || []
      dish.ingredients.push({ id: ingredientId, amount })
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
    },

    getStandardIngredients() {
      return Object.values(dishes.byId)
        .filter(dish => dish.alwaysOnList)
        .map(dish => dish.ingredients)
        .flat()
    }
  }
}
