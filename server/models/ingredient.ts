import { Models } from "."
import { Store } from "../EventStore/EventStore"
import { ModelWriter } from "./ModelWriter"

type IngredientId = string

export type Ingredient = {
  id?: IngredientId
  name: string
  unit: string
  group: string
}

type UpdateParams = {
  ingredientId: IngredientId,
  name: string,
  value: string
}

type WriterFunction = (ingredient: Ingredient) => void

export type IngredientModel = {
  getAll(): Ingredient[]
  byId(id: IngredientId): Ingredient | undefined
  byName(name: string): Ingredient | undefined
  byExample(item: Ingredient, strict?: boolean): Ingredient | undefined
}

const ingredients = {
  byId: {} as Record<IngredientId, Ingredient>,
  byName: {} as Record<IngredientId, Ingredient>
}

const aliases = {} as Record<IngredientId, IngredientId>

const ingredientFields = ['name', 'unit', 'group']

export function addIngredient(writer: WriterFunction, data: Ingredient): void {
  const ingredient = {
    id: '' + data.id,
    name: data.name.trim(),
    unit: data.unit,
    group: data.group || '',
  }
  const existing = ingredients.byName[ingredient.name.toLowerCase()]
  if (existing) {
    aliases['' + ingredient.id] = '' + existing.id
  } else {
    ingredient.group = ingredient.group || 'other'
    ingredients.byId['' + ingredient.id] = ingredient
    ingredients.byName[ingredient.name.toLowerCase()] = ingredient
    writer(ingredient)
  }
}

export function updateIngredient(writer: WriterFunction, { ingredientId, name, value }: UpdateParams): void {
  if (!ingredientFields.includes(name)) {
    throw Error(`Trying to set an unknown field of ingredient`)
  }
  const ingredient = getIngredientById(ingredientId)
  if (!ingredient) {
    throw Error('Ingredient not found')
  }
  ingredient[name as keyof Ingredient] = value
  writer(ingredient)
}

export function getIngredientById(id: IngredientId): Ingredient | undefined {
  if (aliases['' + id]) {
    return ingredients.byId[aliases['' + id]]
  }
  return ingredients.byId[id]
}

export function getIngredientByName(name: string): Ingredient | undefined {
  return ingredients.byName[name]
}

export default function ({ store, models, modelWriter }: { store: Store, models: Models, modelWriter: ModelWriter }): IngredientModel {
  const { ingredientAdded, ingredientUpdated } = models.getEvents()
  store
    .on(ingredientAdded, (ingredient: Ingredient) => addIngredient(modelWriter.writeIngredient, ingredient))
    .on(ingredientUpdated, (params: UpdateParams) => updateIngredient(modelWriter.writeIngredient, params))

  return {
    getAll(): Ingredient[] {
      return Object.values(ingredients.byId)
    },

    byId: getIngredientById,
    byName: getIngredientByName,

    byExample(item: Ingredient, strict = false): Ingredient | undefined {
      if (item.id) {
        return ingredients.byId[item.id]
      }
      const pattern = new RegExp(
        strict
          ? '^' + item.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'
          : item.name
      )
      return Object.values(ingredients.byId).find(i => i.name.match(pattern))
    },
  }
}
