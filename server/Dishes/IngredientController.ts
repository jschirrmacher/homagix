import { v4 as uuid } from 'uuid'
import { Store } from '../EventStore/EventStore'
import { Models } from '../models'
import { Ingredient } from '../models/ingredient'

type IngredientListResult = {
  ingredients: Ingredient[]
  standards: Ingredient[]
}

export type IngredientController = {
  getIngredients(): Promise<IngredientListResult>
  setIngredientGroup(id: string, group: string): Promise<Ingredient>
  addIngredient(ingredient: Ingredient): Promise<Ingredient>
}

export default ({
  models,
  store,
}: {
  models: Models
  store: Store
}): IngredientController => {
  const { ingredientUpdated, ingredientAdded } = models.ingredient.events

  async function getIngredients(): Promise<IngredientListResult> {
    return {
      ingredients: await models.ingredient.getAll(),
      standards: models.dish
        .getStandardIngredients()
        .map(i => ({ ...(models.ingredient.byId(i.id) as Ingredient), ...i })),
    }
  }

  async function setIngredientGroup(
    id: string,
    group: string
  ): Promise<Ingredient> {
    await store.emit(ingredientUpdated(id, 'group', group))
    return models.ingredient.byId(id) as Ingredient
  }

  async function addIngredient(ingredient: Ingredient): Promise<Ingredient> {
    ingredient.id = uuid()
    ingredient.group = ingredient.group || 'other'
    await store.emit(ingredientAdded(ingredient))
    return ingredient
  }

  return {
    getIngredients,
    setIngredientGroup,
    addIngredient,
  }
}
