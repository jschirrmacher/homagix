const ingredients = {
  byId: {},
  byName: {},
}

const aliases = {}

const ingredientFields = ['name', 'unit', 'group']

export function addIngredient(writer, { id, name, unit, group }) {
  const ingredient = { id: '' + id, name: name.trim(), unit, group: group || '' }
  const existing = ingredients.byName[name.toLowerCase()]
  if (existing) {
    aliases['' + id] = existing.id
  } else {
    ingredients.byId['' + id] = ingredient
    ingredients.byName[name.toLowerCase()] = ingredient
    writer(ingredient)
  }
}

export function updateIngredient(writer, { ingredientId, name, value }) {
  if (!ingredientFields.includes(name)) {
    throw Error(`Trying to set an unknown field of ingredient`)
  }
  const ingredient = getIngredientById(ingredientId)
  ingredient[name] = value
  writer(ingredient)
}

export function getIngredientById(id) {
  if (aliases['' + id]) {
    return ingredients.byId[aliases['' + id]]
  }
  return ingredients.byId[id]
}

export function getIngredientByName(name) {
  return ingredients.byName[name]
}

export default function ({ store, events, modelWriter }) {
  const curry = (f) => (data) => f(modelWriter.writeIngredient, data)
  store
    .on(events.ingredientAdded, curry(addIngredient))
    .on(events.ingredientUpdated, curry(updateIngredient))

  return {
    getAll: () => Object.values(ingredients.byId),
    byId: getIngredientById,
    byName: getIngredientByName,

    byExample(item, strict = false) {
      if (item.id) {
        return this.byId(item.id)
      }
      const pattern = new RegExp(strict ? ('^' + item.name + '$') : item.name)
      return Object.values(ingredients.byId).find(i => i.name.match(pattern))
    }
  }
}
