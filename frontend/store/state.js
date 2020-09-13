export function getDefaultState() {
  return {
    startDate: new Date(),
    proposals: [],
    allIngredients: [],
    standardItems: [],
    changes: [],
    accepted: [],
    declined: [],
    error: {},
    units: [],
    activeItemId: undefined
  }
}

export const state = getDefaultState()
