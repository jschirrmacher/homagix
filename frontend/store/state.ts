import {
  User,
  Dish,
  Ingredient,
  CompleteItem,
  Unit,
  ItemGroup,
  Proposal,
} from '../app-types'

export type State = {
  currentUser: User
  startDate: Date
  weekplan: Proposal[]
  dishes: Dish[]
  allIngredients: Ingredient[]
  standardItems: CompleteItem[]
  changes: CompleteItem[]
  accepted: string[]
  declined: string[]
  error?: {
    message: string
    details?: unknown
  }
  alert?: {
    title: string
    message: string
  }
  units: Unit[]
  activeItemId?: string
  itemGroups: Record<string, ItemGroup>
  currentDishId: string
}

export const itemGroups: Record<string, ItemGroup> = {
  fruit: { order: 1, title: 'Obst & Gemüse' },
  breakfast: { order: 2, title: 'Brot & Frühstück' },
  meat: { order: 3, title: 'Fleisch' },
  cooled: { order: 4, title: 'Frische & Kühlung' },
  tinned: { order: 5, title: 'Nahrungsmittel' },
  drinks: { order: 6, title: 'Getränke' },
  frozen: { order: 7, title: 'Tiefgekühlt' },
  other: { order: 8, title: 'Sonstiges' },
}

export function getDefaultState(): State {
  return {
    currentUser: {} as User,
    startDate: new Date(),
    weekplan: [],
    dishes: [],
    allIngredients: [],
    standardItems: [],
    changes: [],
    accepted: [],
    declined: [],
    error: undefined,
    alert: {
      title: '',
      message: '',
    },
    units: [],
    activeItemId: undefined,
    itemGroups,
    currentDishId: '',
  }
}

export const state = getDefaultState()
