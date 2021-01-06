const lists = {}

function addDish(writer, { dishId, listId }) {
  lists[listId] = lists[listId] || []
  lists[listId].includes(dishId) || lists[listId].push(dishId)
  writer(listId, lists[listId])
}

function removeDish(writer, { dishId, listId }) {
  lists[listId] = lists[listId].filter(id => id !== dishId)
  writer(listId, lists[listId])
}

export default function ({ store, events, modelWriter }) {
  const curry = f => data => f(modelWriter.writeDishlist, data)
  store
    .on(events.addDishToList, curry(addDish))
    .on(events.removeDishFromList, curry(removeDish))

  return {
    getById: listId => lists[listId],
  }
}
