const logger = console

function addIfNotAlreadyIn(array, element) {
  const existing = array.findIndex(el => el.id === element.id)
  if (existing !== -1) {
    if (array[existing].unit !== element.unit) {
      logger.error(array[existing], element)
      throw Error(
        `Problem: ingredient '${element.name}' is specified with different units!`
      )
    }
    array[existing].originalAmount =
      array[existing].originalAmount || array[existing].amount
    array[existing].amount = array[existing].amount + element.amount
    return array
  } else {
    return [...array, element]
  }
}

function addDetails(state) {
  return function (i) {
    const item = state.allIngredients.find(item => item.id === i.id) || i
    return {
      ...i,
      name: item.name,
      unit: item.unit,
      group: { ...state.itemGroups[item.group], id: item.group },
    }
  }
}

function getItemsFromWeekplan(state) {
  return state.weekplan
    .filter(p => p.dishId && state.accepted.includes(p.dishId))
    .flatMap(p => state.dishes.find(d => d.id === p.dishId).items)
}

function getProposedOrStandardItems(state) {
  return [...getItemsFromWeekplan(state), ...state.standardItems]
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
  return (
    a.group.order - b.group.order ||
    a.name.toLowerCase().localeCompare(b.name.toLowerCase)
  )
}

export const getters = {
  proposedItems(state) {
    return getItemsFromWeekplan(state)
      .map(addDetails(state))
      .reduce(addIfNotAlreadyIn, [])
  },

  shoppinglist(state) {
    return shoppingListFromState(state).sort(compareItems)
  },

  itemsInShoppingList(state): boolean {
    return shoppingListFromState(state).some(item => item.amount)
  },

  maxServedDate(state): string {
    const max = state.dishes.reduce((max, current) => Math.max(max, current.last ? +new Date(current.last) : 0), 0)
    return (new Date(max)).toISOString().split('T')[0]
  },

  nextDayToServe(state): string {
    const lastServedDay = new Date(getters.maxServedDate(state))
    lastServedDay.setDate(lastServedDay.getDate() + 1)
    return lastServedDay.toISOString().split('T')[0]
  },
}
