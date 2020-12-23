export function getDefaultState() {
  return {
    startDate: new Date(),
    weekplan: [],
    dishes: [],
    allIngredients: [],
    standardItems: [],
    changes: [],
    accepted: [],
    declined: [],
    error: {},
    units: [],
    activeItemId: undefined,
    itemGroups: {
      fruit: { order: 1, title: 'Obst & Gemüse' },
      breakfast: { order: 2, title: 'Brot & Frühstück' },
      meat: { order: 3, title: 'Fleisch' },
      cooled: { order: 4, title: 'Frische & Kühlung' },
      tinned: { order: 5, title: 'Nahrungsmittel' },
      drinks: { order: 6, title: 'Getränke' },
      frozen: { order: 7, title: 'Tiefgekühlt' },
      other: { order: 8, title: 'Sonstiges' }
    }
  }
}

export const state = getDefaultState()
