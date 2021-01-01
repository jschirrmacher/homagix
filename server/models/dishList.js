const lists = {}

function invite(writer, { userId, listId }) {
  lists[listId] = lists[listId] || { users: [listId], dishes: [] }
  lists[listId].users.push(userId)
  writer(listId, lists[listId])
}

function addDish(writer, { dishId, listId }) {
  lists[listId] = lists[listId] || { users: [listId], dishes: [] }
  lists[listId].dishes.push(dishId)
  writer(listId, lists[listId])
}

function removeDish(writer, { dishId, listId }) {
  lists[listId].dish = lists[listId].dishes.filter(id => id !== dishId)
  writer(listId, lists[listId])
}

function byId(listId) {
  return lists[listId]
}

function getDishes(listId) {
  return lists[listId].dishes
}

export default function ({ store, events, modelWriter }) {
  const curry = (f) => (data) => f(modelWriter.writeDishList, data)
  store
    .on(events.invite, curry(invite))
    .on(events.addDishToList, curry(addDish))
    .on(events.removeDishFromList, curry(removeDish))

  return {
    byId,
    getDishes,
  }
}
