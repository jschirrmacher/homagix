import { Transform, TransformOptions, TransformCallback } from 'stream'
import Dish, { DishModel, DishMutators, getDishById } from '../models/dish'
import {
  addIngredient,
  updateIngredient,
  getIngredientById,
  Ingredient,
} from '../models/ingredient'
import ModelWriter from '../models/ModelWriter'
import Config from '../Config'

const { dataDir: basePath } = Config()
const modelWriter = ModelWriter({ basePath })
const dishMutator = DishMutators(modelWriter.writeDish)

export default class mig3 extends Transform {
  constructor(options = {} as TransformOptions) {
    options.objectMode = true
    super(options)
  }

  _transform(
    event: Record<string, unknown>,
    encoding: BufferEncoding,
    callback: TransformCallback
  ): void {
    switch (event.type) {
      case 'dishAdded': {
        delete event.type
        event.items = event.items || []
        dishMutator.addDish(event)
        break
      }

      case 'ingredientAdded': {
        delete event.type
        event.unit = (event.unit as { name: string }).name || event.unit
        addIngredient(modelWriter.writeIngredient, event)
        break
      }

      case 'ingredientAssigned': {
        const dish = getDishById(event.dishId as string)
        if (!dish) {
          throw Error(`Dish #${event.dishId} not found`)
        }
        if (!getIngredientById(event.ingredientId as string)) {
          throw Error(`Ingredient #${event.ingredientId} not found`)
        }
        dish.items = dish.items || []
        dish.items.push({
          amount: event.amount as number,
          id: event.ingredientId as string,
        })
        dishMutator.addDish(dish)
        break
      }

      case 'ingredientUpdated': {
        const ingredient = getIngredientById(event.ingredientId as string)
        if (!ingredient) {
          throw Error(`Ingredient #${event.ingredientId} not found`)
        }
        ingredient[event.name as keyof Ingredient] = event.value as string
        updateIngredient(modelWriter.writeIngredient, event)
        break
      }

      default:
        this.push(event)
    }
    callback()
  }
}
