import { v4 as uuid } from 'uuid'

export default ({ models, store }) => {
  const { ingredientUpdated, ingredientAdded } = models.getEvents()

  async function getIngredients() {
    return {
      ingredients: await models.ingredient.getAll(),
      standards: models.dish
        .getStandardIngredients()
        .map(i => ({ ...models.ingredient.byId(i.id), ...i })),
    }
  }

  async function setIngredientGroup(id, group) {
    await store.emit(ingredientUpdated(id, 'group', group))
    return models.ingredient.byId(id)
  }

  async function addIngredient(ingredient) {
    ingredient.id = uuid()
    ingredient.group = 'other'
    await store.emit(ingredientAdded(ingredient))
    return ingredient
  }

  return {
    getIngredients,
    setIngredientGroup,
    addIngredient,
  }
}