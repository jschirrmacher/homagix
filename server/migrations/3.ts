import path from 'path'
import { Transform, TransformOptions, TransformCallback } from 'stream'
import { addDish, getDishById } from '../models/dish'
import {
  addIngredient,
  updateIngredient,
  getIngredientById,
  Ingredient,
} from '../models/ingredient.js'
import ModelWriter from '../models/ModelWriter'

const DIRNAME = path.resolve(path.dirname(''))
const basePath = path.join(DIRNAME, '..', '..', 'data')
const modelWriter = ModelWriter({ basePath })

export default class mig3 extends Transform {
  constructor(options = {} as TransformOptions) {
    options.objectMode = true
    super(options)
  }

  _transform(event: any, encoding: BufferEncoding, callback: TransformCallback) {
    switch (event.type) {
      case 'dishAdded': {
        const dish = event
        delete dish.type
        dish.items = dish.items || []
        addDish(modelWriter.writeDish, dish)
        break
      }

      case 'ingredientAdded': {
        const ingredient = event
        delete ingredient.type
        ingredient.unit = ingredient.unit.name || ingredient.unit
        addIngredient(modelWriter.writeIngredient, ingredient)
        break
      }

      case 'ingredientAssigned': {
        const dish = getDishById(event.dishId)
        if (!dish) {
          throw Error(`Dish #${event.dishId} not found`)
        }
        if (!getIngredientById(event.ingredientId)) {
          throw Error(`Ingredient #${event.ingredientId} not found`)
        }
        dish.items = dish.items || []
        dish.items.push({ amount: event.amount, id: event.ingredientId })
        addDish(modelWriter.writeDish, dish)
        break
      }

      case 'ingredientUpdated': {
        const ingredient = getIngredientById(event.ingredientId)
        if (!ingredient) {
          throw Error(`Ingredient #${event.ingredientId} not found`)
        }
        ingredient[event.name as keyof Ingredient] = event.value
        updateIngredient(modelWriter.writeIngredient, event)
        break
      }

      default:
        this.push(event)
    }
    callback()
  }
}
