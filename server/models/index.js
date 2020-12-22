import Events from '../Events.js'
import Dish from './dish.js'
import Ingredient from './ingredient.js'
import DishHistory from './dishHistory.js'

export default function ({ store, modelWriter }) {
  const models = {}
  const events = Events({ models })
  
  models.dish = Dish({ store, events, modelWriter })
  models.ingredient = Ingredient({ store, events, modelWriter })
  models.dishHistory = DishHistory({ store, events, modelWriter })

  return models
}
