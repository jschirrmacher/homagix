import Events from '../Events.js'
import Dish from './Dish.js'
import Ingredient from './Ingredient.js'

export default function ({ store }) {
  const models = {}
  const events = Events({ models })
  
  models.dish = Dish({ store, events })
  models.ingredient = Ingredient({ store, events })

  return models
}
