import { itemGroups } from '@/lib/itemGroups'

function addIfNotAlreadyIn(array, element) {
  const existing = array.findIndex(el => el.id === element.id)
  if (existing !== -1) {
    if (array[existing].unit !== element.unit) {
      throw Error(`Problem: ingredient '${element.name}' is specified with different units!`)
    }
    return array.map(el => el.id === element.id ? {...el, amount: el.amount + element.amount} : el)
  } else {
    return [...array, element]
  }
}

function applyChanges(ingredients, changes) {
  return ingredients
    .concat(changes)
    .reduce(addIfNotAlreadyIn, [])
}

function addDetails(items, allIngredients) {
  return items.map(i => {
    const item = allIngredients.find(item => item.id === i.id)
    return { ...i, name: item.name, group: { ...itemGroups[item.group], id: item.group }}
  })
}

function shoppingListFromState(state) {
  const ingredients = state.proposals
    .filter(p => state.accepted.includes(p.id))
    .map(p => p.ingredients)
    .flat()
  const modified = applyChanges(ingredients, state.changes)
  return addDetails(modified, state.allIngredients)
}

export const getters = {
  shoppinglist(state) {
    return shoppingListFromState(state)
      .sort((a, b) => a.group.order - b.group.order)
  },

  itemsInShoppingList(state) {
    return shoppingListFromState(state).length > 0
  }
}
