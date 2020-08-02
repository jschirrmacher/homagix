import { itemGroups } from '@/lib/itemGroups'

export const getters = {
  shoppinglist(state) {
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
    
    return state.proposals
      .filter(p => state.accepted.includes(p.id))
      .map(p => p.ingredients)
      .flat()
      .concat(state.extras)
      .reduce(addIfNotAlreadyIn, [])
      .map(i => {
        const item = state.allIngredients.find(item => item.id === i.id)
        return { ...i, name: item.name, group: { ...itemGroups[item.group], id: item.group }}
      })
      .sort((a, b) => a.group.order - b.group.order)
  },

  itemsOnShoppingList(state) {
    return state.accepted.length + state.extras.length > 0
  }
}
