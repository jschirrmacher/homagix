const logger = console

function addIfNotAlreadyIn(array, element) {
  const existing = array.findIndex(el => el.id === element.id)
  if (existing !== -1) {
    if (array[existing].unit !== element.unit) {
      logger.error(array[existing], element)
      throw Error(`Problem: ingredient '${element.name}' is specified with different units!`)
    }
    array[existing].originalAmount = array[existing].originalAmount || array[existing].amount
    array[existing].amount = array[existing].amount + element.amount
    return array
  } else {
    return [...array, element]
  }
}

function addDetails(state) {
  return function (i) {
    const item = state.allIngredients.find(item => item.id === i.id) || i
    return { ...i, name: item.name, unit: item.unit, group: { ...state.itemGroups[item.group], id: item.group }}
  }
}

function getProposedOrStandardItems(state) {
  return [
    ...state.weekplan
      .filter(p => state.accepted.includes(p.dish.id))
      .map(p => p.dish.items)
      .flat(),
    ...state.standardItems
  ]
}

function shoppingListFromState(state) {
  return [...getProposedOrStandardItems(state), ...state.changes]
    .map(addDetails(state))
    .reduce(addIfNotAlreadyIn, [])
}

function compareItems(a, b) {
  if (a.group.order && !b.group.order) {
    return -1
  }
  if (b.group.order && !a.group.order) {
    return 1
  }
  return a.group.order - b.group.order || a.name.toLowerCase().localeCompare(b.name.toLowerCase)
}

export const getters = {
  proposedItems(state) {
    return state.weekplan
    .filter(p => state.accepted.includes(p.dish.id))
    .map(p => p.dish.items)
    .flat()
    .map(addDetails(state))
    .reduce(addIfNotAlreadyIn, [])
  },

  shoppinglist(state) {
    return shoppingListFromState(state)
      .sort(compareItems)
  },

  itemsInShoppingList(state) {
    return shoppingListFromState(state).some(item => item.amount)
  }
}
