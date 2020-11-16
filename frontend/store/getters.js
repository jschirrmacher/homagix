import { itemGroups } from '../lib/itemGroups.js'

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

function addDetails(allIngredients) {
  return function (i) {
    const item = allIngredients.find(item => item.id === i.id) || i
    return { ...i, name: item.name, unit: item.unit, group: { ...itemGroups[item.group], id: item.group }}
  }
}

function getProposedOrStandardItems(state) {
  return [
    ...state.proposals
      .filter(p => state.accepted.includes(p.id))
      .map(p => p.items)
      .flat(),
    ...state.standardItems
  ]
}

function shoppingListFromState(state) {
  return [...getProposedOrStandardItems(state), ...state.changes]
    .map(addDetails(state.allIngredients))
    .reduce(addIfNotAlreadyIn, [])
}

export const getters = {
  proposedItems(state) {
    return state.proposals
    .filter(p => state.accepted.includes(p.id))
    .map(p => p.items)
    .flat()
    .map(addDetails(state.allIngredients))
    .reduce(addIfNotAlreadyIn, [])
  },

  shoppinglist(state) {
    return shoppingListFromState(state)
      .sort((a, b) => a.group.order - b.group.order || a.name.toLowerCase().localeCompare(b.name.toLowerCase))
  },

  itemsInShoppingList(state) {
    return shoppingListFromState(state).some(item => item.amount)
  }
}
