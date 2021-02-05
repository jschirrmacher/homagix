type User = {
  id: string
  firstName: string
}

type Item = {
  id: string
  amount: number
}

export type Dish = {
  id: string
  name: string
  recipe?: string
  source?: string
  last?: string
  items: Item[]
}

type Ingredient = {
  id: string
  name: string
  unit: string
  group: string
}

type CompleteItem = Ingredient & { amount: number }

type Unit = {
  id: string
  name: string
  increment: number
}

type State = {
  currentUser: User
  startDate: Date
  weekplan: Dish[]
  dishes: Dish[]
  allIngredients: Ingredient[]
  standardItems: CompleteItem[]
  changes: CompleteItem[]
  accepted: string[]
  declined: string[]
  error: {
    message?: string
  }
  alert?: {
    title: string
    message: string
  }
  units: Unit[]
  activeItemId?: string
  itemGroups: Record<string, { order: number, title: string }>
}

const itemGroups = {
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
    error: {},
    alert: {
      title: '',
      message: '',
    },
    units: [],
    activeItemId: undefined,
    itemGroups,
  }
}

export const state = getDefaultState()
