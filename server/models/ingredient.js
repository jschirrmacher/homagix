export default function ({ store, events }) {
  const { ingredientAdded, ingredientUpdated } = events

  const ingredients = {
    byId: {},
    byName: {},
  }

  store
    .on(ingredientAdded, ({ id, name, unit }) => {
      const ingredient = { id, name, unit }
      ingredients.byId[id] = ingredient
      ingredients.byName[name.toLowerCase()] = ingredient
    })
    .on(ingredientUpdated, ({ ingredientId, name, value }) => {
      const ingredient = ingredients.byId[ingredientId]
      ingredient[name] = value
    })

  return {
    getAll() {
      return Object.values(ingredients.byId)
    },

    byId(id) {
      return ingredients.byId[id]
    },

    byName(name) {
      return ingredients.byName[name]
    },

    byExample(item) {
      if (item.id) {
        return this.byId(item.id)
      }
      const pattern = new RegExp('.*' + item.name + '.*')
      return Object.values(ingredients.byId).find(i => i.name.match(pattern))
    }
  }
}
