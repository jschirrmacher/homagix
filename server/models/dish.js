const dishes = {
  byId: {},
  byName: {},
}

const editableFields = ['name', 'recipe', 'source']

export function addDish(
  writer,
  { id, name, source, alwaysOnList, items, recipe, image }
) {
  const dish = { id: '' + id, name, items: items || [] }
  alwaysOnList && (dish.alwaysOnList = true)
  source && (dish.source = source)
  recipe && (dish.recipe = recipe)
  image && (dish.image = image)
  dishes.byId[dish.id] = dish
  dishes.byName[dish.name.toLowerCase()] = dish
  writer(dish)
}

export function updateDish(writer, { id, ...rest }) {
  const dish = dishes.byId[id]
  if (!dish) {
    throw Error(`Dish #${id} not found`)
  }
  if (Object.keys(rest).reduce((write, field) => {
      if (editableFields.includes(field)) {
      dish[field] = rest[field]
      write = true
    }
  }, false)) {
    writer(dish)
  }
}

export function assignIngredient(writer, { dishId, ingredientId, amount }) {
  const dish = dishes.byId[dishId]
  dish.items = dish.items || []
  dish.items.push({ id: '' + ingredientId, amount })
  writer(dish)
}

export function serve(writer, { dishId, date }) {
  const dish = dishes.byId[dishId]
  dish.last = date
  writer(dish)
}

export function getAllDishes() {
  return Object.values(dishes.byId)
}

export function getDishById(id) {
  return dishes.byId[id]
}

export function getDishByName(name) {
  return dishes.byName[name]
}

export function getStandardIngredients() {
  return Object.values(dishes.byId)
    .filter(dish => dish.alwaysOnList)
    .map(dish => dish.items)
    .flat()
}

export default function ({ store, events, modelWriter }) {
  const curry = f => data => f(modelWriter.writeDish, data)
  store
    .on(events.dishAdded, curry(addDish))
    .on(events.dishModified, curry(updateDish))
    .on(events.ingredientAssigned, curry(assignIngredient))
    .on(events.served, curry(serve))

  return {
    getAll: getAllDishes,
    byId: getDishById,
    byName: getDishByName,
    getStandardIngredients,

    reset() {
      dishes.byId = {}
      dishes.byName = {}
    },
  }
}
