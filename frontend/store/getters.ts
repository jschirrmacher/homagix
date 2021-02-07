import { CompleteItem, Item, Proposal } from "../app-types"
import { State } from './state'

const logger = console

function addIfNotAlreadyIn(array: CompleteItem[], element: CompleteItem): CompleteItem[] {
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

function addDetails(state: State) {
  const defaultIngredient = { name: '', group: 'other', unit: 'Pkg' }
  return function (item: Item): CompleteItem {
    const ingredient = state.allIngredients.find(i => i.id === item.id) || { ...item, ...defaultIngredient }
    return {
      ...item,
      name: ingredient.name,
      unit: ingredient.unit,
      group: {
        id: ingredient.group,
        ...state.itemGroups[ingredient.group],
      },
    }
  }
}

function getItemsFromWeekplan(state: State): CompleteItem[] {
  return state.weekplan
    .filter(p => p.dishId && state.accepted.includes(p.dishId))
    .flatMap((p: Proposal) => state.dishes.find(d => d.id === p.dishId)?.items)
}

function getProposedOrStandardItems(state: State) {
  return [...getItemsFromWeekplan(state), ...state.standardItems]
}

function shoppingListFromState(state: State) {
  return [...getProposedOrStandardItems(state), ...state.changes]
    .map(addDetails(state))
    .reduce(addIfNotAlreadyIn, [])
}

function compareItems(a: CompleteItem, b: CompleteItem): number {
  if (a.group.order && !b.group.order) {
    return -1
  }
  if (b.group.order && !a.group.order) {
    return 1
  }
  return (
    a.group.order - b.group.order ||
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  )
}

export interface Getters {
  proposedItems: CompleteItem[]
  shoppinglist: CompleteItem[]
  itemsInShoppingList: boolean
  maxServedDate: string
  nextDayToServe: string
}

export const getters = {
  proposedItems(state: State): CompleteItem[] {
    return getItemsFromWeekplan(state)
      .map(addDetails(state))
      .reduce(addIfNotAlreadyIn, [])
  },

  shoppinglist(state: State): CompleteItem[] {
    return shoppingListFromState(state).sort(compareItems)
  },

  itemsInShoppingList(state: State): boolean {
    return shoppingListFromState(state).some(item => item.amount)
  },

  maxServedDate(state: State): string {
    const max = state.dishes.reduce((max, current) => Math.max(max, current.last ? +new Date(current.last) : 0), 0)
    return (new Date(max)).toISOString().split('T')[0]
  },

  nextDayToServe(state: State, getters: Getters): string {
    const lastServedDay = new Date(getters.maxServedDate)
    lastServedDay.setDate(lastServedDay.getDate() + 1)
    return lastServedDay.toISOString().split('T')[0]
  },
}
