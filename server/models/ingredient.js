export default function ({ store, events }) {
  const { ingredientAdded, ingredientUpdated } = events

  const ingredients = {
    byId: {},
    byName: {},
  }

  const aliases = {}

  store
    .on(ingredientAdded, ({ id, name, unit }) => {
      const ingredient = { id, name, unit }
      const existing = ingredients.byName[name.toLowerCase()]
      if (existing) {
        aliases[id] = existing.id
      } else {
        ingredients.byId[id] = ingredient
        ingredients.byName[name.toLowerCase()] = ingredient
      }
    })
    .on(ingredientUpdated, ({ ingredientId, name, value }) => {
      const ingredient = byId(ingredientId)
      ingredient[name] = value
    })

  function getAll() {
    return Object.values(ingredients.byId)
  }

  function byId(id) {
    if (aliases[id]) {
      return ingredients.byId[aliases[id]]
    }
    return ingredients.byId[id]
  }

  function byName(name) {
    return ingredients.byName[name]
  }

  function byExample(item) {
    if (item.id) {
      return this.byId(item.id)
    }
    const pattern = new RegExp('.*' + item.name + '.*')
    return Object.values(ingredients.byId).find(i => i.name.match(pattern))
  }

  return { getAll, byId, byName, byExample }
}
