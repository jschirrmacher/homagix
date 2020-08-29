import Events from '../Events.js'
import Dish from './dish.js'
import Ingredient from './ingredient.js'

export default function ({ store }) {
  const models = {}
  const events = Events({ models })
  
  models.dish = Dish({ store, events })
  models.ingredient = Ingredient({ store, events })

  return models
}
